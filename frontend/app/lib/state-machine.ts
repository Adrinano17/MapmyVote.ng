/**
 * State Machine for AI Navigation System
 * Implements 9 distinct states for the navigation flow
 */

export type NavigationState =
  | "welcome"
  | "location_permission"
  | "language_selection"
  | "voice_consent"
  | "polling_unit_input"
  | "polling_unit_validation"
  | "navigation"
  | "arrival"
  | "confusion_help"

export type StateTransition = {
  from: NavigationState
  to: NavigationState
  condition?: () => boolean
}

export interface StateContext {
  currentState: NavigationState
  previousState?: NavigationState
  locationGranted: boolean
  languageSelected: string
  voiceEnabled: boolean
  pollingUnitCode?: string
  pollingUnitValidated: boolean
  isNavigating: boolean
  hasArrived: boolean
  needsHelp: boolean
  // Persist React component state to survive unmounts
  userLocation?: { latitude: number; longitude: number }
  pollingUnitData?: any // PollingUnit & { ward?: Ward }
}

export class NavigationStateMachine {
  private state: NavigationState = "welcome"
  private context: StateContext = {
    currentState: "welcome",
    locationGranted: false,
    languageSelected: "en",
    voiceEnabled: true,
    pollingUnitValidated: false,
    isNavigating: false,
    hasArrived: false,
    needsHelp: false,
  }

  private transitions: Map<NavigationState, NavigationState[]> = new Map([
    ["welcome", ["language_selection"]],
    ["language_selection", ["voice_consent"]],
    ["voice_consent", ["location_permission"]],
    ["location_permission", ["navigation", "confusion_help", "polling_unit_input"]],
    ["polling_unit_input", ["polling_unit_validation"]],
    ["polling_unit_validation", ["navigation", "polling_unit_input"]],
    ["navigation", ["arrival", "confusion_help"]],
    ["arrival", ["welcome"]],
    ["confusion_help", ["navigation", "polling_unit_input"]],
  ])

  getCurrentState(): NavigationState {
    return this.state
  }

  getContext(): StateContext {
    return { ...this.context }
  }

  updateContext(updates: Partial<StateContext>): void {
    this.context = { ...this.context, ...updates }
    // Ensure currentState is always in sync
    this.context.currentState = this.state
  }

  canTransitionTo(targetState: NavigationState): boolean {
    const allowedStates = this.transitions.get(this.state)
    // Allow skipping to location_permission if we have a polling unit code
    if (this.context.pollingUnitCode && this.state === "welcome" && targetState === "location_permission") {
      console.log("StateMachine.canTransitionTo - Allowing direct transition from welcome to location_permission because pollingUnitCode exists:", this.context.pollingUnitCode)
      return true
    }
    const canTransition = allowedStates?.includes(targetState) ?? false
    if (!canTransition && this.state === "welcome" && targetState === "location_permission") {
      console.log("StateMachine.canTransitionTo - Blocked transition from welcome to location_permission. Context:", JSON.stringify(this.context))
    }
    return canTransition
  }

  transitionTo(newState: NavigationState): boolean {
    if (!this.canTransitionTo(newState)) {
      console.warn(
        `Cannot transition from ${this.state} to ${newState}. Allowed states: ${this.transitions.get(this.state)}`
      )
      return false
    }

    this.context.previousState = this.state
    this.state = newState
    this.context.currentState = newState

    // Update context based on state
    this.updateContextForState(newState)

    return true
  }

  private updateContextForState(state: NavigationState): void {
    switch (state) {
      case "navigation":
        this.context.isNavigating = true
        break
      case "arrival":
        this.context.hasArrived = true
        this.context.isNavigating = false
        break
      case "confusion_help":
        this.context.needsHelp = true
        break
      default:
        break
    }
  }

  // Helper methods for common transitions
  grantLocationPermission(): boolean {
    this.updateContext({ locationGranted: true })
    // Only transition to navigation if polling unit code exists AND we're coming from map with code
    // The component will check the URL parameter to determine if we should transition
    // For now, stay in location_permission and let the component decide
    // Component will check URL parameter and redirect to map if no code, or transition to navigation if code exists
    return true
  }

  denyLocationPermission(): boolean {
    this.updateContext({ locationGranted: false })
    return this.transitionTo("confusion_help")
  }

  selectLanguage(language: string): boolean {
    this.updateContext({ languageSelected: language })
    return this.transitionTo("voice_consent")
  }

  setVoicePreference(enabled: boolean): boolean {
    this.updateContext({ voiceEnabled: enabled })
    return this.transitionTo("location_permission")
  }

  submitPollingUnitCode(code: string): boolean {
    this.updateContext({ pollingUnitCode: code })
    return this.transitionTo("polling_unit_validation")
  }

  validatePollingUnit(success: boolean): boolean {
    if (success) {
      this.updateContext({ pollingUnitValidated: true })
      return this.transitionTo("navigation")
    } else {
      return this.transitionTo("polling_unit_input")
    }
  }

  startNavigation(): boolean {
    return this.transitionTo("navigation")
  }

  confirmArrival(): boolean {
    return this.transitionTo("arrival")
  }

  requestHelp(): boolean {
    return this.transitionTo("confusion_help")
  }

  resumeNavigation(): boolean {
    this.updateContext({ needsHelp: false })
    return this.transitionTo("navigation")
  }

  reset(): void {
    this.state = "welcome"
    this.context = {
      currentState: "welcome",
      locationGranted: false,
      languageSelected: "en",
      voiceEnabled: true,
      pollingUnitValidated: false,
      isNavigating: false,
      hasArrived: false,
      needsHelp: false,
    }
  }
}

// Singleton instance
let stateMachineInstance: NavigationStateMachine | null = null

export function getStateMachine(): NavigationStateMachine {
  if (!stateMachineInstance) {
    stateMachineInstance = new NavigationStateMachine()
  }
  return stateMachineInstance
}
