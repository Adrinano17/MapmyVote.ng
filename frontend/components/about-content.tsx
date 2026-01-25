"use client"

import { MapPin, Users, Globe, Shield, Mic, Navigation, Bot } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/hooks/use-language"
import { translations } from "@/lib/types"

export function AboutContent() {
  const { language } = useLanguage()
  const t = 
    language === "en" ? translations.en :
    language === "yo" ? translations.yo :
    language === "pcm" ? translations.pcm :
    language === "ha" ? translations.en :
    language === "ig" ? translations.en :
    translations.en

  const aboutTexts = {
    en: {
      title: "About MapMyVote.ng",
      subtitle:
        "A civic technology platform designed to help eligible voters in Ibadan North Local Government Area locate their assigned polling units with ease.",
      missionTitle: "Our Mission",
      missionP1:
        "MapMyVote.ng was created to address a common challenge faced by Nigerian voters: difficulty in locating their assigned polling units. Many eligible voters, especially first-time voters and those who have relocated, struggle to find accurate information about where to cast their votes.",
      missionP2:
        "Our platform aims to reduce voter confusion, improve accessibility for all citizens, and ultimately encourage greater electoral participation in our democracy.",
      featuresTitle: "Key Features",
      interactiveMaps: "Interactive Maps",
      interactiveMapsDesc: "View all polling units on an interactive map with precise coordinates",
      voiceSupport: "Voice Support",
      voiceSupportDesc: "Search and listen to information in English, Yoruba, or Pidgin",
      turnByTurn: "Turn-by-Turn Directions",
      turnByTurnDesc: "Get navigation assistance directly to your polling unit",
      multilingual: "Multilingual",
      multilingualDesc: "Full support for English, Yoruba, and Nigerian Pidgin",
      accessible: "Accessible",
      accessibleDesc: "Designed for all users, including those with disabilities",
      accurateData: "Accurate Data",
      accurateDataDesc: "Up-to-date polling unit information from official sources",
      aiAssistant: "AI Assistant",
      aiAssistantDesc: "Get help from Ìrànlọ́wọ́, your personal voting guide",
      coverageTitle: "Current Coverage",
      coverageP1:
        "MapMyVote.ng currently covers Ibadan North Local Government Area in Oyo State, Nigeria. This includes all 12 electoral wards and their respective polling units.",
      coverageP2:
        "We are actively working to expand our coverage to other local government areas across Oyo State and eventually nationwide.",
      disclaimerTitle: "Disclaimer",
      disclaimerText:
        "MapMyVote.ng is an independent civic technology project and is not affiliated with the Independent National Electoral Commission (INEC) or any government body. While we strive to provide accurate and up-to-date information, we recommend voters verify their polling unit assignment through official INEC channels.",
    },
    yo: {
      title: "Nípa MapMyVote.ng",
      subtitle:
        "Ètò ìmọ̀-ẹ̀rọ tí a ṣe láti ràn àwọn oníbò tó tó yẹ ní Ìjọba Ìbílẹ̀ Ibadan Àríwá lọ́wọ́ láti wá ibi ìdìbò wọn lọ́nà rọrùn.",
      missionTitle: "Iṣẹ́ Àkọ́kọ́ Wa",
      missionP1:
        "A dá MapMyVote.ng láti yanjú ìṣòro tí àwọn oníbò Nigeria máa ń kojú: ìṣòro wíwá ibi ìdìbò wọn. Ọ̀pọ̀ àwọn oníbò, pàápàá àwọn tó ń dìbò fún ìgbà àkọ́kọ́ àti àwọn tó ti yípadà síbi mìíràn, máa ń ṣòro láti rí àlàyé tó péye nípa ibití wọ́n yóò ti dìbò.",
      missionP2:
        "Ètò wa ní èrò láti dín ìdàrú oníbò kù, mú kí gbogbo ènìyàn lè ní ànfàní sí, kí ó sì mú kí ọ̀pọ̀lọpọ̀ ènìyàn lè kópa nínú ìdìbò nínú ìjọba àwọn ènìyàn wa.",
      featuresTitle: "Àwọn Ẹ̀yà Pàtàkì",
      interactiveMaps: "Àwọn Maapu Alábàáṣiṣẹ́pọ̀",
      interactiveMapsDesc: "Wo gbogbo ibi ìdìbò lórí maapu pẹ̀lú àwọn àmì tó péye",
      voiceSupport: "Àtìlẹ́yìn Ohùn",
      voiceSupportDesc: "Wá kí o sì gbọ́ àlàyé ní Gẹ̀ẹ́sì, Yorùbá, tàbí Pidgin",
      turnByTurn: "Ìtọ́sọ́nà",
      turnByTurnDesc: "Gba ìrànlọ́wọ́ ìtọ́sọ́nà tààrà sí ibi ìdìbò rẹ",
      multilingual: "Èdè Púpọ̀",
      multilingualDesc: "Àtìlẹ́yìn kíkún fún Gẹ̀ẹ́sì, Yorùbá, àti Pidgin Nigeria",
      accessible: "Ìrọrùn Láti Lò",
      accessibleDesc: "A ṣe fún gbogbo ènìyàn, pẹ̀lú àwọn tó ní àìlera",
      accurateData: "Dátà Tó Péye",
      accurateDataDesc: "Àlàyé ibi ìdìbò tó ṣẹ̀ṣẹ̀ jáde láti ọ̀dọ̀ àwọn orísun òṣìṣẹ́",
      aiAssistant: "Olùrànlọ́wọ́ AI",
      aiAssistantDesc: "Gba ìrànlọ́wọ́ láti ọ̀dọ̀ Ìrànlọ́wọ́, olùtọ́sọ́nà ìdìbò rẹ",
      coverageTitle: "Àgbègbè Tó Bò",
      coverageP1:
        "MapMyVote.ng ń bò Ìjọba Ìbílẹ̀ Ibadan Àríwá ní Ìpínlẹ̀ Oyo, Nigeria lọ́wọ́lọ́wọ́. Èyí pẹ̀lú gbogbo wọ́dù ìdìbò 12 àti àwọn ibi ìdìbò tó wà nínú wọn.",
      coverageP2: "A ń ṣiṣẹ́ takuntakun láti fi àgbègbè mìíràn sí káàkiri Ìpínlẹ̀ Oyo àti gbogbo orílẹ̀-èdè níkẹyìn.",
      disclaimerTitle: "Àkíyèsí",
      disclaimerText:
        "MapMyVote.ng jẹ́ iṣẹ́ ìmọ̀-ẹ̀rọ olómìnira tí kò ní ìsopọ̀ pẹ̀lú INEC tàbí ẹgbẹ́ ìjọba kankan. Bí ó tilẹ̀ jẹ́ pé a ń gbìyànjú láti pèsè àlàyé tó péye àti tó ṣẹ̀ṣẹ̀ jáde, a gbà àwọn oníbò nímọ̀ràn láti jẹ́rìísí ibi ìdìbò wọn nípasẹ̀ àwọn ọ̀nà INEC.",
    },
    pcm: {
      title: "About MapMyVote.ng",
      subtitle:
        "Na civic technology platform wey we design to help people wey fit vote for Ibadan North Local Government Area find where dem go vote easy easy.",
      missionTitle: "Our Mission",
      missionP1:
        "We create MapMyVote.ng to solve one problem wey Nigerian voters dey face: e hard to find where dem go vote. Plenty people wey wan vote, especially first-time voters and people wey don relocate, dey struggle to find correct information about where to cast their vote.",
      missionP2:
        "Our platform wan reduce voter confusion, make am easy for everybody to get access, and encourage more people to participate for election for our country.",
      featuresTitle: "Key Features",
      interactiveMaps: "Interactive Maps",
      interactiveMapsDesc: "See all polling units for interactive map with correct location",
      voiceSupport: "Voice Support",
      voiceSupportDesc: "Search and listen to information for English, Yoruba, or Pidgin",
      turnByTurn: "Turn-by-Turn Directions",
      turnByTurnDesc: "Get navigation wey go carry you go your polling unit",
      multilingual: "Many Languages",
      multilingualDesc: "Full support for English, Yoruba, and Nigerian Pidgin",
      accessible: "Easy to Use",
      accessibleDesc: "We design am for everybody, including people wey get disability",
      accurateData: "Correct Data",
      accurateDataDesc: "Up-to-date polling unit information from official sources",
      aiAssistant: "AI Helper",
      aiAssistantDesc: "Get help from Ìrànlọ́wọ́, your personal voting guide",
      coverageTitle: "Where We Cover",
      coverageP1:
        "MapMyVote.ng dey cover Ibadan North Local Government Area for Oyo State, Nigeria right now. This one include all 12 electoral wards and their polling units.",
      coverageP2:
        "We dey work hard to expand to other local government areas across Oyo State and eventually cover the whole country.",
      disclaimerTitle: "Disclaimer",
      disclaimerText:
        "MapMyVote.ng na independent civic technology project and we no dey affiliated with INEC or any government body. Even though we dey try to give correct and current information, we advise voters make dem verify their polling unit through official INEC channels.",
    },
  }

  const content = 
    language === "en" ? aboutTexts.en :
    language === "yo" ? aboutTexts.yo :
    language === "pcm" ? aboutTexts.pcm :
    aboutTexts.en

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground md:text-5xl text-balance">
              {content.title}
            </h1>
            <p className="text-lg text-muted-foreground md:text-xl text-pretty">{content.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-foreground">{content.missionTitle}</h2>
            <p className="mb-4 text-muted-foreground">{content.missionP1}</p>
            <p className="text-muted-foreground">{content.missionP2}</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">{content.featuresTitle}</h2>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{content.interactiveMaps}</h3>
                <p className="text-sm text-muted-foreground">{content.interactiveMapsDesc}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Mic className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{content.voiceSupport}</h3>
                <p className="text-sm text-muted-foreground">{content.voiceSupportDesc}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Navigation className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{content.turnByTurn}</h3>
                <p className="text-sm text-muted-foreground">{content.turnByTurnDesc}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{content.multilingual}</h3>
                <p className="text-sm text-muted-foreground">{content.multilingualDesc}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{content.accessible}</h3>
                <p className="text-sm text-muted-foreground">{content.accessibleDesc}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{content.accurateData}</h3>
                <p className="text-sm text-muted-foreground">{content.accurateDataDesc}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-3">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{content.aiAssistant}</h3>
                <p className="text-sm text-muted-foreground">{content.aiAssistantDesc}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-foreground">{content.coverageTitle}</h2>
            <p className="mb-4 text-muted-foreground">{content.coverageP1}</p>
            <p className="text-muted-foreground">{content.coverageP2}</p>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-foreground">{content.disclaimerTitle}</h2>
            <p className="text-sm text-muted-foreground">
              {content.disclaimerText}{" "}
              <a
                href="https://cvr.inecnigeria.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                cvr.inecnigeria.org
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
