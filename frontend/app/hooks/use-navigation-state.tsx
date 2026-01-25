"use client"

import { useState, useEffect, useCallback } from "react"
import { getStateMachine, type NavigationState, type StateContext } from "@/lib/state-machine"

export function useNavigationState() {
  const [state, setState] = useState<NavigationState>("welcome")
  const [context, setContext] = useState<StateContext>(() => {
    const machine = getStateMachine()
    return machine.getContext()
  })

  // Load state from localStorage on mount
  // But clear polling unit data if we're on /navigate without a code (fresh navigation start)
  useEffect(() => {
    const machine = getStateMachine()
    const savedState = localStorage.getItem("navigation_state")
    const savedContext = localStorage.getItem("navigation_context")

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:restore-start',message:'State restoration starting',data:{hasSavedState:!!savedState,hasSavedContext:!!savedContext,currentPath:typeof window !== 'undefined' ? window.location.pathname : 'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (savedState && savedContext) {
      try {
        const parsedContext = JSON.parse(savedContext)
        // Check if we're on /navigate without a code - if so, clear polling unit data
        const currentUrl = typeof window !== 'undefined' ? window.location.pathname : ''
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        const codeFromUrl = urlParams?.get("code")
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:restore-check',message:'Checking restoration conditions',data:{currentUrl,codeFromUrl,hasCode:!!codeFromUrl,isNavigatePage:currentUrl === '/navigate',shouldClear:currentUrl === '/navigate' && !codeFromUrl,locationGranted:parsedContext.locationGranted,savedState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        if (currentUrl === '/navigate' && !codeFromUrl) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:restore',message:'No code in URL - forcing fresh navigation start during restoration',data:{hadPollingUnitCode:!!parsedContext.pollingUnitCode,hadPollingUnitData:!!parsedContext.pollingUnitData,locationGranted:parsedContext.locationGranted,savedState},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          // Force fresh start: clear polling unit data AND reset locationGranted to force questions
          parsedContext.pollingUnitCode = undefined
          parsedContext.pollingUnitData = undefined
          parsedContext.pollingUnitValidated = false
          parsedContext.isNavigating = false
          parsedContext.hasArrived = false
          parsedContext.locationGranted = false // Force questions to be asked
          // Always reset to welcome state to force question flow
          machine.updateContext(parsedContext)
          machine.transitionTo("welcome")
          const updatedState = machine.getCurrentState()
          const updatedContext = machine.getContext()
          setState(updatedState)
          setContext(updatedContext)
          // Save cleared state to localStorage so it persists
          localStorage.setItem("navigation_state", updatedState)
          localStorage.setItem("navigation_context", JSON.stringify(updatedContext))
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:restore-complete',message:'Restoration complete - reset to welcome',data:{updatedState,locationGranted:updatedContext.locationGranted,hasPollingUnitCode:!!updatedContext.pollingUnitCode},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
        } else {
          // Normal restoration
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:restore-normal',message:'Normal restoration (not clearing)',data:{currentUrl,codeFromUrl,hasCode:!!codeFromUrl,savedState,locationGranted:parsedContext.locationGranted},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          machine.updateContext(parsedContext)
          if (machine.canTransitionTo(savedState as NavigationState)) {
            machine.transitionTo(savedState as NavigationState)
          }
          setState(machine.getCurrentState())
          setContext(machine.getContext())
        }
      } catch (error) {
        console.error("Failed to restore navigation state:", error)
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:restore-error',message:'Restoration error',data:{error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:restore-no-data',message:'No saved state to restore',data:{hasSavedState:!!savedState,hasSavedContext:!!savedContext},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
  }, [])

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const machine = getStateMachine()
    localStorage.setItem("navigation_state", state)
    localStorage.setItem("navigation_context", JSON.stringify(context))
  }, [state, context])

  const transitionTo = useCallback((newState: NavigationState) => {
    const machine = getStateMachine()
    if (machine.transitionTo(newState)) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  const updateContext = useCallback((updates: Partial<StateContext>) => {
    const machine = getStateMachine()
    machine.updateContext(updates)
    setContext(machine.getContext())
  }, [])

  const reset = useCallback(() => {
    const machine = getStateMachine()
    machine.reset()
    setState(machine.getCurrentState())
    setContext(machine.getContext())
    localStorage.removeItem("navigation_state")
    localStorage.removeItem("navigation_context")
  }, [])

  // Convenience methods
  const grantLocationPermission = useCallback(() => {
    const machine = getStateMachine()
    const oldState = machine.getCurrentState()
    const currentContext = machine.getContext()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:67',message:'grantLocationPermission called',data:{oldState,pollingUnitCode:currentContext.pollingUnitCode,hasPollingUnitCode:!!currentContext.pollingUnitCode,context:JSON.stringify(currentContext)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    const result = machine.grantLocationPermission()
    const newState = machine.getCurrentState()
    const newContext = machine.getContext()
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:72',message:'grantLocationPermission result',data:{oldState,newState,result,transitioned:result && newState!==oldState,isNavigation:newState==='navigation',newContext:JSON.stringify(newContext)},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    if (result) {
      setState(newState)
      setContext(newContext)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/a0691e2c-cdd7-47b0-9342-76cf3ac06d2f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'use-navigation-state.tsx:78',message:'State updated after grantLocationPermission',data:{newState,isNavigation:newState==='navigation',willShowMap:newState==='navigation'},timestamp:Date.now(),sessionId:'debug-session',runId:'run3',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
      return true
    }
    return false
  }, [])

  const denyLocationPermission = useCallback(() => {
    const machine = getStateMachine()
    if (machine.denyLocationPermission()) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  const selectLanguage = useCallback((language: string) => {
    const machine = getStateMachine()
    if (machine.selectLanguage(language)) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  const setVoicePreference = useCallback((enabled: boolean) => {
    const machine = getStateMachine()
    if (machine.setVoicePreference(enabled)) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  const submitPollingUnitCode = useCallback((code: string) => {
    const machine = getStateMachine()
    if (machine.submitPollingUnitCode(code)) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  const validatePollingUnit = useCallback((success: boolean) => {
    const machine = getStateMachine()
    if (machine.validatePollingUnit(success)) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  const startNavigation = useCallback(() => {
    const machine = getStateMachine()
    if (machine.startNavigation()) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  const confirmArrival = useCallback(() => {
    const machine = getStateMachine()
    if (machine.confirmArrival()) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  const requestHelp = useCallback(() => {
    const machine = getStateMachine()
    if (machine.requestHelp()) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  const resumeNavigation = useCallback(() => {
    const machine = getStateMachine()
    if (machine.resumeNavigation()) {
      setState(machine.getCurrentState())
      setContext(machine.getContext())
      return true
    }
    return false
  }, [])

  return {
    state,
    context,
    transitionTo,
    updateContext,
    reset,
    grantLocationPermission,
    denyLocationPermission,
    selectLanguage,
    setVoicePreference,
    submitPollingUnitCode,
    validatePollingUnit,
    startNavigation,
    confirmArrival,
    requestHelp,
    resumeNavigation,
  }
}








