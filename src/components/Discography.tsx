import React, { useState, useEffect, useRef } from 'react';
import { Disc, Play, Pause, Award, Info, RefreshCw, Check, X, Trophy, Copy, Search, Volume2, SkipForward, SkipBack, Shuffle, Repeat, Heart, FileText, Globe, Twitter, Facebook, Link, Share2, MessageCircle } from 'lucide-react';
import { ALBUMS } from '../data';
import { TriviaQuestion } from '../types';

interface ExtendedSong {
  id: string;
  title: string;
  albumTitle: string;
  albumCover: string;
  duration: string;
  trackNumber: number;
  plays: string;
  category: 'lyrical' | 'instrumental' | 'unreleased' | 'demo';
  language: 'english' | 'hindi' | 'telugu';
  audioUrl: string;
  singer?: string;
  lyrics?: string;
  transliteration?: string;
  translation?: string;
}

const INDIE_SONGS_METADATA: Record<string, { singer: string; lyrics: string; transliteration?: string; translation?: string }> = {
  "Sunset Grid": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Driving down the sunset grid, chasing ghosts of what we did\nNeon lights in rear view mirrors, making all our worries clearer\nOh we ride, under purple skies\nWe survived, no more cold goodbyes"
  },
  "Retrograde": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Static lines on the radio screen, the heaviest mood you've ever seen\nWe are caught in a retrograde loop, falling down in a crazy swoop\nBut we spin, till the morning light\nDeep within, we can heal the night"
  },
  "Echoes in Tokyo": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Raindrops fall on Shibuya street, synchronized to our racing beat\nLost in translation, found in the sound, feet don't even touch the ground\nEchoes calling from the tower\nWait for me, just one more hour"
  },
  "Midnight Drive": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Engine purring like a sleeping cat, driving past where the lovers sat\nCruising through the city lines, searching for some secret signs\nDon't look back, we have got the speed\nYou are everything I'll ever need"
  },
  "Static Waves": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Pulsing currents through the cable wire, feeding into our deep desire\nCan you hear the static glow? Let the ambient currents flow\nWaves of silver, waves of blue\nEverything returns to you"
  },
  "Nocturnal": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "We belong to the midnight hour, blooming like a black velvet flower\nWhen the rest of the world's asleep, secrets are the things we keep\nNocturnal souls, burning bright\nGuided by the pale blue light"
  },
  "Pale Blue Light": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "In the shadow of the television screen, the sweetest dream we've ever seen\nFramed inside a pale blue light, we can dance away the night\nHold me close, don't let go\nLet the ocean currents flow"
  },
  "Ghost In The Machine": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Code lines running in the central brain, trying to forget all the pain\nAre you real or just a phantom sound? Spinning all our worlds around\nI am the ghost, you are the key\nSet the digital circuits free"
  },
  "Velvet Skyline": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Sailing over velvet city clouds, far away from the noisy crowds\nGold and violet in the afternoon, waiting for the rising moon\nSkyline high, skyline deep\nThese are promises we'll keep"
  },
  "After the Rain": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Smell of ozone on the wet asphalt, nobody's error, nobody's fault\nStorm has passed, the air is clean, freshest green we've ever seen\nSunlight breaking through the grey\nWe can find our brand new way"
  },
  "Golden Hour": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Warmth is spreading on your glowing face, captured in a slow motion space\nSeconds stretch into an endless day, all our troubles fade away\nThis is the golden hour of light\nEverything is feeling right"
  },
  "Astral Plane": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Floating up into the starry height, guided by the cosmic light\nPassing moons and meteor showers, counting all the secret hours\nOn the astral plane we meet\nTo the universal beat"
  },
  "Resonance": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Vibrations humming in the wooden floor, echoing through the open door\nFrequency of you and me, beautiful acoustic harmony\nResonance that never ends\nBetween lovers, between friends"
  },
  "Silent Symphony": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Music playing without any sound, peace is what we finally found\nIn the quiet of your gentle hand, things that only we understand\nSilent strings and quiet bells\nWhere the sweetest magic dwells"
  },
  "Infinite Echo": {
    singer: "Julian Vance (Velvet Horizon)",
    lyrics: "Sound waves traveling through empty space, searching for your lovely face\nBouncing off the canyon walls, until the gentle evening falls\nInfinite loop, infinite drive\nThis is how we feel alive"
  }
};

const REGIONAL_SONGS_METADATA: Record<string, {
  singer: string;
  lyrics: string;
  transliteration: string;
  translation: string;
  audioUrl: string;
  cover: string;
}> = {
  // Telugu
  "Samajavaragamana": {
    singer: "Sid Sriram (Composer: Thaman S)",
    lyrics: "సమజవరగమన.. నిను చూసి ఆగగలనా\nమనసా నీ వశమాయెనే.. కలలా కదలాడుతుంటే",
    transliteration: "Samajavaragamana.. ninu choosi aagagalana\nmanasaa nee vashamaayene.. kalalaa kadalaaduthunte",
    translation: "O graceful walking beauty.. can I stop myself after looking at you?\nMy heart is entirely under your spell, moving like a beautiful dream.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600"
  },
  "Butta Bomma": {
    singer: "Armaan Malik (Composer: Thaman S)",
    lyrics: "బుట్టబొమ్మ బుట్టబొమ్మ నన్ను సుట్టుకోవే\nజిందగీకే అట్టబొమ్మ జంటకట్టుకోве",
    transliteration: "Buttabomma Buttabomma nannu suttukove\njindageeke attabomma jantakuttukove",
    translation: "O beautiful basket-doll, come wrap around me!\nIn this board game of life, couple up with me as my perfect pair.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
  },
  "Naatu Naatu": {
    singer: "Rahul Sipligunj, Kaala Bhairava (Composer: M.M. Keeravani)",
    lyrics: "నాటు నాటు నాటు నాటు వీర నాటు\nతుమ్ములదూళి రేగేలా రచ్చరచ్చ చేయు",
    transliteration: "Naatu Naatu Naatu Naatu Veera Naatu\nthummuladooli reegelaa raccharaccha cheyu",
    translation: "Dance, dance, wild and raw native country dance!\nKick up the dust of the thorns and create a glorious scene!",
    audioUrl: "https://archive.org/download/naatu-naatu-telugu-rrr-full-song-4k-uhd-ntr-ram-charan-m.m.-keeravaani-ss-rajamouli/naatu-naatu-telugu-rrr-full-song-4k-uhd-ntr-ram-charan-m.m.-keeravaani-ss-rajamouli_vbr.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600"
  },
  "Oo Antava Mawa": {
    singer: "Indravathi Chauhan (Composer: Devi Sri Prasad)",
    lyrics: "ఊ అంటావా మావా.. ఊహూ అంటావా మావా\nమగవాళ్ళ బుద్దే వంకర బుద్ది అంటారు",
    transliteration: "Oo antava mawa.. Oohoo antava mawa\nmagavalla budde vankara buddi antaaru",
    translation: "Will you say yes, my dear? Or will you say no, my dear?\nThey say men have devious, crooked minds, but you shine bright.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400"
  },
  "Srivalli": {
    singer: "Sid Sriram (Composer: Devi Sri Prasad)",
    lyrics: "చూపే బంగారమాయెనే శ్రీవల్లి.. మాటే ముత్యాలమాయెనే\nనవ్వులన్నీ గంధాలమాయెనే శ్రీవల్లి.. మనసంతా నీదేలే",
    transliteration: "Choope bangaaramayene Srivalli.. maate mutyaalamayene\nnavvulanni gandhaalamayene Srivalli.. manasantha needele",
    translation: "Your glance is like pure gold Srivalli.. your speech is like precious pearls.\nYour laughter is like sandalwood Srivalli.. my entire heart is yours.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    cover: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400"
  },
  "Kurchi Madathapetti": {
    singer: "Sri Krishna, Sahithi Chaganti (Composer: Thaman S)",
    lyrics: "కుర్చీ మడతపెట్టి తాతా.. దుమ్ముదులిపేయ్ రా\nమాస్ బీటు వేస్తే నరనరాల్లో కరెంట్ రేగుతది",
    transliteration: "Kurchi madathapetti thaatha.. dummudulipey ra\nmaas beetu vesthe naranarallo current reguthadi",
    translation: "Fold the wooden chair, old man.. and shake the dust off!\nWhen this energetic mass beat drops, electricity pulses in our veins.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
  },
  "Adigaa Adigaa": {
    singer: "Sid Sriram (Composer: Gopi Sundar)",
    lyrics: "అడిగా అడిగా నెమ్మదిగా.. మనసే నిన్నే నిలదీసి\nకదిలే క్షణమే నిలిచేనా.. నీ నీడను చేరితే",
    transliteration: "Adigaa adigaa nemmadigaa.. manase ninne niladeesi\nkadile kshaname nilichenaa.. nee needanu cherithe",
    translation: "I asked gently.. my heart confronted you questioning,\nWill this fleeting moment freeze if I reach your comforting shadow?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600"
  },
  "Nee Kannu Neeli Samudram": {
    singer: "Javed Ali (Composer: Devi Sri Prasad)",
    lyrics: "నీ కన్ను నీలి సముద్రం.. నా మనసేమో అందులో పడవ ప్రయాణం\nసుడిగుండంలో చిక్కుకుందేమో.. ఎటు పోవాలో తెలియని పయనం",
    transliteration: "Nee kannu neeli samudram.. naa manasemo andulo padava prayaanam\nsudigundamlo chikkukundemo.. etu povaalo teliyani payanam",
    translation: "Your eyes are like a blue ocean.. and my heart is a tiny boat sailing in them.\nIt got caught in a beautiful whirlpool, not knowing where the journey leads.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600"
  },
  "O Rendu Prema Meghalu": {
    singer: "Sreerama Chandra (Composer: Vijai Bulganin)",
    lyrics: "ఓ రెండు ప్రేమ మేఘాలు.. గాల్లో తేలుతూ మునిగాయి\nచిరుజల్లులై కురిసే వేళ.. హృదయాలేవో కలిసాయే",
    transliteration: "O rendu prema meghaalu.. gaallo theluthoo munigaayi\nchirujallulai kurise vela.. hrudayaalevo kalisaaye",
    translation: "Oh, two clouds of love, floating and sinking in the breeze.\nAs they drizzle down softly, our hearts somehow connected forever.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400"
  },
  "Inkem Inkem Kaavaale": {
    singer: "Sid Sriram (Composer: Gopi Sundar)",
    lyrics: "ఇంకేం ఇంకేం ఇంకేం కావాలే.. చాల్లే ఇది చాల్లే\nనీ వెంటే నేనుండే ఈ జన్మకు.. ఇది చాల్లే",
    transliteration: "Inkem inkem inkem kaavaale.. chaalle idi chaalle\nee needatho nenu saage payanaaniki.. idi chaalle",
    translation: "What else, what else, what more do I need? This is more than enough.\nTo spend this lifetime walking right beside you is more than enough.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    cover: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400"
  },
  "Fear Song (Devara)": {
    singer: "Anirudh Ravichander",
    lyrics: "ఎర్ర సముద్రం చూసావా.. భయం అంటే తెల్సా నీకు\nసింహం వేటకొస్తే ప్రాణాలైనా వదిలేస్తావ్",
    transliteration: "Erra samudram choosaavaa.. bhayam ante thelsaa neeku\nsimham vetakosthe praanalaainaa vadilesthaav",
    translation: "Have you ever witnessed the red sea? Do you know what true fear is?\nWhen the predator arrives, you surrender even your last breath.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
  },
  "Vellipoke Sundaree": {
    singer: "Karthik (Composer: Harris Jayaraj)",
    lyrics: "వెళ్ళిపోకే సుందరీ.. నన్ను ఒంటరి చేసి\nగుండెల్లో మంటలు రేపి.. ఎటు పోయావే",
    transliteration: "Vellipoke sundaree.. nannu ontari chesi\ngundello mantalu repi.. etu poyaave",
    translation: "Don't go away, beautiful girl, leaving me all alone,\nAfter setting my heart ablaze, where have you vanished?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600"
  },
  "Life of Ram": {
    singer: "Pradeep Kumar (Composer: Govind Vasantha)",
    lyrics: "నేనే నా తోడు.. లోకమే నా గూడు\nఏకాకిగా తిరుగుతూ.. ప్రకృతిని ప్రేమిస్తూ",
    transliteration: "Nene naa thodu.. lokame naa goodu\nekaakigaa thiruguthoo.. prakruthini premisthoo",
    translation: "I am my own companion, the vast world is my nest.\nWandering as a free solitary soul, deeply in love with nature.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400"
  },
  "Arere Yemaindi": {
    singer: "Sid Sriram (Composer: Radhan)",
    lyrics: "అరెరే ఏమైంది.. గుండెల్లో గుబులైంది\nనీ చూపే తగిలాక.. నా మనసు నీదైంది",
    transliteration: "Arere yemaindi.. gundello gubulaindi\nee choope thagilaaka.. naa manasu needaindi",
    translation: "Oh my, what has happened? A sweet restlessness is in my heart.\nEver since your glance touched me, my soul belongs to you.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    cover: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400"
  },
  "Nuvve Nuvve": {
    singer: "K.S. Chithra (Composer: Koti)",
    lyrics: "నువ్వే నువ్వే నా ప్రాణమన్నావు.. ఇప్పుడు ఏమైపోయావు\nకన్నీటి సంద్రాన.. నన్ను ఒంటరిగా విడిచావు",
    transliteration: "Nuvve nuvve naa praanamannaavu.. ippudu emaipoyaavu\nkanneti sandraana.. nannu ontarigaa vidichaavu",
    translation: "You said you were my life.. where are you now?\nLeaving me stranded alone in this deep ocean of tears.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
  },
  "Oye Oye": {
    singer: "Siddharth (Composer: Anand George)",
    lyrics: "ఓయ్ ఓయ్ అంటుంది నా మనసే.. వినలేవా నా పిలుపు\nనీతో కలిసి నడవడమే.. నా జన్మ ధన్యత",
    transliteration: "Oye oye antundi naa manase.. vinaleve naa pilupu\nneetho kalisi nadavadame.. naa janma dhanyatha",
    translation: "My heart is shouting 'Oye Oye', can't you hear my calling?\nTo walk this path hand-in-hand with you is my life's complete fulfillment.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600"
  },
  "My Love": {
    singer: "Shreya Ghoshal (Composer: Thaman S)",
    lyrics: "నా ప్రేమ నీతోనే మొదలైంది.. నా జీవన గమనం నువ్వే\nప్రతి శ్వాసలో నిన్నే తలచుకుంటూ",
    transliteration: "Naa prema neethone modalaindi.. naa jeevana gamanam nuvve\nprathi shwaasalo ninne thalachukuntoo",
    translation: "My love story began with you.. you are the compass of my life.\nThinking of you with every breath I take.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600"
  },
  "Priya Mithunam": {
    singer: "S.P. Balasubrahmanyam, K.S. Chithra",
    lyrics: "ప్రియ మిధునం మనమేలే.. యుగయుగాల బంధమిదే\nకలిసుందాం ఎల్లప్పుడూ.. ప్రేమాలయంలో",
    transliteration: "Priya mithunam manamele.. yugayugaala bandhamide\nkalisundaam ellappudoo.. premaalayandoo",
    translation: "We are the beloved eternal pair, a bond spanning over ages.\nLet us stay united forever in this sanctuary of love.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
  },
  "Chinnadana Nee Kosam": {
    singer: "Nitin, Shravana Bhargavi",
    lyrics: "చిన్నదానా నీ కోసం.. గుండె కోసి ఇవ్వనా\nమనసంతా నువ్వే నిండిపోయావే.. ప్రేమా",
    transliteration: "Chinnadaanaa nee kosam.. gunde kosi ivvanaa\nmanasantha nuvve nindipoyaave.. premaa",
    translation: "O beautiful girl, just for you, shall I offer my whole heart?\nYou have fully occupied my entire soul, my true love.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600"
  },
  "Kalaavathi": {
    singer: "Sid Sriram (Composer: Thaman S)",
    lyrics: "కళ్ళావతి.. నువ్వే నా ప్రాణవతి\nవందల్లో ఒకతివి కాదే.. నా గుండెలో దేవతవు",
    transliteration: "Kallaavathi.. nuvve naa praanavathi\nvandallo okathivi kaadhe.. naa gundelo devathavu",
    translation: "O beautiful-eyed Kalaavathi.. you are the keeper of my life.\nYou aren't just one in a hundred; you are the goddess of my heart.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600"
  },

  // Hindi
  "Kesariya": {
    singer: "Arijit Singh (Composer: Pritam)",
    lyrics: "केसरिया तेरा इश्क़ है पिया, रंग जाऊं जो मैं हाथ लगाऊं\nदिन बीते सारा तेरी फ़िक्र में, रैन कटे तेरी याद में",
    transliteration: "Kesariya tera ishq hai piya, rang jaoon jo main haath lagaoon\ndin beete saara teri fikr mein, rain kate teri yaad mein",
    translation: "Your love is like saffron, my darling, dyeing me in its golden hues whenever I touch it.\nI spend my entire day worrying about you, and nights remembering your face.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
  },
  "Tum Hi Ho": {
    singer: "Arijit Singh (Composer: Mithoon)",
    lyrics: "क्यूंकि तुम ही हो, अब तुम ही हो, ज़िंदगी अब तुम ही हो\nचैन भी, मेरा दर्द भी, मेरी आिशक़ी अब तुम ही हो",
    transliteration: "Kyunki tum hi ho, ab tum hi ho, zindagi ab tum hi ho\nchain bhi, mera dard bhi, meri aashiqi ab tum hi ho",
    translation: "Because only you are, now and forever, my life and my peaceful refuge.\nMy comfort, my sweetest pain, my complete devotion is only you.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600"
  },
  "Apna Bana Le": {
    singer: "Arijit Singh (Composer: Sachin-Jigar)",
    lyrics: "अपना बना ले पिया, अपना बना ले पिया\nदिल के नगर में बसेरा बसा ले पिया",
    transliteration: "Apna bana le piya, apna bana le piya\ndil ke nagar mein basera basa le piya",
    translation: "Make me yours, my beloved, make me yours;\nbuild a beautiful home for us in the city of hearts.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600"
  },
  "Chaleya": {
    singer: "Arijit Singh, Shilpa Rao (Composer: Anirudh Ravichander)",
    lyrics: "तेरी राहों में बिछे हैं सितारे, चलेया तेरी ओर मैं\nइश्क़ की है ये कैसी पहेली, समझा ना कोई यहाँ",
    transliteration: "Teri raahon mein biche hain sitare, chaleya teri ore main\nishq ki hai ye kaisi paheli, samjha na koi yahaan",
    translation: "Stars are scattered along your pathways, and I am drawn walking towards you.\nWhat kind of beautiful riddle is this love? Nobody here can ever decipher.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400"
  },
  "Raataan Lambiyan": {
    singer: "Jubin Nautiyal, Asees Kaur (Composer: Tanishk Bagchi)",
    lyrics: "काटूं कैसे रातां सांवरे, जिया नहीं जाता सुण बावरे\nके रातां लम्बियां लम्बियां रे, कटे तेरे संगियां संगियां रे",
    transliteration: "Kaatoon kaise raataan saanware, jiya nahi jaata sun baawre\nke raataan lambiyan lambiyan re, kate tere sangiyan sangiyan re",
    translation: "How do I endure these long nights, my darling? My heart cannot survive without you.\nFor these nights are endless, and only pass when spent in your presence.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    cover: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400"
  },
  "Deva Deva": {
    singer: "Arijit Singh, Jonita Gandhi (Composer: Pritam)",
    lyrics: "चिनगारी कोई भड़के तो, सावन उसे बुझाए\nसावन जो अगन लगाए, उसे कौन बुझाए",
    transliteration: "Chingaari koi bhadke toh, saawan use bujhaaye\nsaawan jo agan lagaaye, use kaun bujhaaye",
    translation: "If a spark erupts, the rain clouds put it out.\nBut if the rain itself ignites a fire inside the soul, who can ever extinguish it?",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
  },
  "Kabira": {
    singer: "Tochi Raina, Rekha Bhardwaj (Composer: Pritam)",
    lyrics: "रे कबीरा मान जा, रे कबीरा मान जा\nआजा तुझको पुकारे तेरी परछाइयां",
    transliteration: "Re Kabira maan ja, re Kabira maan ja\naaja tujhko pukaare teri parchhaiyaan",
    translation: "O restless soul Kabira, listen to me;\ncome back, your own beautiful shadows are calling you home.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600"
  },
  "Tera Ban Jaunga": {
    singer: "Akhil Sachdeva, Tulsi Kumar",
    lyrics: "तेरा बन जाऊंगा, मैं हर ज़िक्र में तेरा नाम लाऊंगा\nतू मेरी मंज़िल है, मैं तेरा रास्ता बन जाऊंगा",
    transliteration: "Tera ban jaunga, main har zikr mein tera naam launga\ntoo meri manzil hai, main tera raasta ban jaunga",
    translation: "I will become entirely yours, mentioning your name in every single breath.\nYou are my ultimate destination, and I will become the path leading to you.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600"
  },
  "Ranjha": {
    singer: "B Praak, Jasleen Royal",
    lyrics: "ओ रांझा वे, तू मेरी जान है, तू ही मेरा जहान है\nतेरे बिना जीना भी क्या जीना, तू ही मेरी शान है",
    transliteration: "O Ranjha ve, too meri jaan hai, too hi mera jahaan hai\ntere bina jeena bhi kya jeena, too hi meri shaan hai",
    translation: "O my beloved Ranjha, you are my life, my entire universe.\nWhat is a life without you? You are my sole pride.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400"
  },
  "Guli Mata": {
    singer: "Saad Lamjarred, Shreya Ghoshal",
    lyrics: "गुली माता, तू मेरी आँखों का तारा है\nतेरे बिना ये दिल आवारा है",
    transliteration: "Guli mata, too meri aankhon ka taara hai\nye dil aawara hai",
    translation: "O flower child, you are the shining star of my eyes.\nWithout you, this heart wanders around aimlessly.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    cover: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400"
  },
  "Pasoori": {
    singer: "Ali Sethi, Shae Gill",
    lyrics: "आवां दूनीया दे विच खुशियाँ, तू आ भी जा मेरे यार\nके दिल विच दर्द छुपा है, इसे दूर कर दे यार",
    transliteration: "Aawaan duniya de vich khushiyaan, too aa bhi ja mere yaar\nke dil vich dukh chhupa hai, ise door kar de yaar",
    translation: "I bring joy to this vast world, come to me my dear friend.\nFor there is a sweet pain hidden in my heart, wash it away.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
  },
  "O Maahi": {
    singer: "Arijit Singh (Composer: Pritam)",
    lyrics: "ओ माही वे, तू मेरा आसमां है, तू ही मेरा ठिकाना है\nतेरे बिना सूनी है डगरिया, तू ही मेरा आशियाना है",
    transliteration: "O Maahi ve, too mera aasmaan hai, too hi mera thikaana hai\ntere bina sooni hai dagariya, too hi mera aashiyaana hai",
    translation: "O my beloved Maahi, you are my sky, my only shelter.\nWithout you, the path is desolate; you are my cozy home.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600"
  },
  "Heeriye": {
    singer: "Jasleen Royal, Arijit Singh",
    lyrics: "हीरिये, तू मेरी तक़दीर है, तू ही मेरी हीर है\nतेरे बिना ये ज़िंदगी अधूरी, तू ही मेरी तस्वीर है",
    transliteration: "Heeriye, too meri taqdeer hai, too hi meri heer hai\ntere bina ye zindagi adhoori, too hi meri tasveer hai",
    translation: "O Heeriye, you are my destiny, my true companion.\nWithout you, this life is incomplete; you are my portrait of love.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600"
  },
  "Mann Meri Jaan": {
    singer: "King",
    lyrics: "मान मेरी जान, मैं तुझे खोने नहीं दूंगा\nतू मेरी है, मैं तुझे किसी का होने नहीं दूंगा",
    transliteration: "Mann meri jaan, main tujhe khone nahi doonga\ntoo meri hai, main tujhe kisi ka hone nahi doonga",
    translation: "Listen to me, my soulmate, I will never let you go.\nYou are mine, and I will protect you for eternity.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400"
  },
  "Agar Tum Saath Ho": {
    singer: "Arijit Singh, Alka Yagnik (Composer: A.R. Rahman)",
    lyrics: "पल भर ठहर जाओ, दिल को करार आ जाए\nअगर तुम साथ हो, तो हर राह आसान हो जाए",
    transliteration: "Pal bhar theher jao, dil ko karaar aa jaaye\nagar tum saath ho, toh har raah aasaan ho jaaye",
    translation: "Stay just for a single moment, so that my heart may find peace.\nIf you are with me, then every difficult path becomes easy.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400"
  },
  "Dil Diyan Gallan": {
    singer: "Atif Aslam (Composer: Vishal-Shekhar)",
    lyrics: "दिल दियां गल्लां कराएंगे नाले बैठ के\nअक्खां च अक्खां पाके वेखेंगे",
    transliteration: "Dil diyan gallan karaange naale baith ke\nakkhaan ch akkhaan paake vekhenge",
    translation: "We shall share our heart's deep secrets, sitting closely together,\nLooking straight into each other's eyes.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600"
  },
  "Channa Mereya": {
    singer: "Arijit Singh (Composer: Pritam)",
    lyrics: "अच्छा चलता हूँ, दुआओं में याद रखना\nमेरे ज़िक्र का ज़ुबान पे स्वाद रखना",
    transliteration: "Accha chalta hoon, duaon mein yaad rakhna\nmere zikr ka zubaan pe swaad rakhna",
    translation: "Farewell then, remember me in your earnest prayers.\nKeep the taste of my name alive on your lips.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    cover: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600"
  },
  "Zaalima": {
    singer: "Arijit Singh, Harshdeep Kaur",
    lyrics: "ओ ज़ालिमा, तेरे इश्क़ में बह गए हम\nतेरे बिना एक पल भी जीना गवारा नहीं",
    transliteration: "O zaalima, tere ishq mein beh gaye hum\ntere bina ek pal bhi jeena gawaara nahi",
    translation: "O ruthless one, I am swept away in your majestic love.\nLiving even a single second without you is unbearable.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600"
  },
  "Ghungroo": {
    singer: "Arijit Singh, Shilpa Rao (Composer: Vishal-Shekhar)",
    lyrics: "घुंघरू टूट गए, तो क्या हुआ यार\nहम तो नाचेंगे मस्ती में आज रात",
    transliteration: "Ghungroo toot gaye, toh kya hua yaar\nham toh naachenge masti mein aaj raat",
    translation: "If the ankle-bells broke, what does it matter my friend?\nWe shall dance in complete ecstasy all night long.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400"
  },
  "Namo Namo": {
    singer: "Amit Trivedi",
    lyrics: "नमो नमो जी शंकरा, भोलेनाथ शंकरा\nजय हो तुम्हारी हे देवा, सबको पार उतारा",
    transliteration: "Namo Namo ji Shankara, Bholenath Shankara\njay ho tumhari he deva, sabko paar utaara",
    translation: "Salutations to Lord Shankara, the innocent guardian.\nVictory be to you, O divine Lord, you deliver everyone across safely.",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    cover: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400"
  }
};

export default function Discography() {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    const album = params.get('album');
    if (album && ALBUMS.some(a => a.id === album)) {
      return album;
    }
    return ALBUMS[0].id;
  });

  // Keep URL parameters updated when active album changes for deep-linking
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    if (selectedAlbumId) {
      params.set('album', selectedAlbumId);
    } else {
      params.delete('album');
    }
    url.search = params.toString();
    window.history.replaceState(null, '', url.toString());
  }, [selectedAlbumId]);

  const [copiedAlbum, setCopiedAlbum] = useState(false);

  const getAlbumShareUrl = (albumId: string) => {
    const origin = window.location.origin + window.location.pathname;
    return `${origin}?tab=discography&album=${albumId}`;
  };

  const getAlbumShareText = (title: string) => {
    return `Check out this amazing Velvet Horizon album: "${title}"`;
  };

  const handleCopyAlbumLink = (albumId: string) => {
    const url = getAlbumShareUrl(albumId);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedAlbum(true);
      setTimeout(() => setCopiedAlbum(false), 2500);
    }).catch(err => {
      console.error("Failed to copy link:", err);
    });
  };
  
  // Real HTML5 Audio Player Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Spotify-like player states
  const [activeTrack, setActiveTrack] = useState<ExtendedSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [showLyricsModal, setShowLyricsModal] = useState(false);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * audio.duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setPlaybackProgress(percentage * 100);
  };

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (clickX / width) * 100));
    setVolume(percentage);
    setIsMuted(false);
  };
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'lyrical' | 'instrumental' | 'unreleased' | 'demo'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'english' | 'hindi' | 'telugu'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const songsPerPage = 12;

  // Trivia Quiz States
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Generate 100+ songs programmatically to avoid hitting token limits
  const [allSongs, setAllSongs] = useState<ExtendedSong[]>([]);

  useEffect(() => {
    // Seed core songs from albums (15 tracks total)
    const baseSongs: ExtendedSong[] = [];
    let baseCounter = 1;
    ALBUMS.forEach(album => {
      album.tracks.forEach(track => {
        const meta = INDIE_SONGS_METADATA[track.title];
        baseSongs.push({
          id: track.id,
          title: track.title,
          albumTitle: album.title,
          albumCover: album.coverUrl,
          duration: track.duration,
          trackNumber: track.trackNumber,
          plays: track.plays,
          category: track.trackNumber % 2 === 0 ? 'lyrical' : 'instrumental',
          language: 'english',
          audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(baseCounter % 16) || 16}.mp3`,
          singer: meta?.singer || "Julian Vance (Velvet Horizon)",
          lyrics: meta?.lyrics || "Instrumental performance with ambient synths and delays."
        });
        baseCounter++;
      });
    });

    // Lists of immersive Telugu and Hindi songs with beautiful regional touch
    const teluguTitles = [
      "Samajavaragamana", "Butta Bomma", "Naatu Naatu", "Oo Antava Mawa", "Srivalli",
      "Kurchi Madathapetti", "Adigaa Adigaa", "Nee Kannu Neeli Samudram", "O Rendu Prema Meghalu", "Inkem Inkem Kaavaale",
      "Fear Song (Devara)", "Vellipoke Sundaree", "Life of Ram", "Arere Yemaindi", "Nuvve Nuvve",
      "Oye Oye", "My Love", "Priya Mithunam", "Chinnadana Nee Kosam", "Kalaavathi"
    ];

    const hindiTitles = [
      "Kesariya", "Tum Hi Ho", "Apna Bana Le", "Chaleya", "Raataan Lambiyan",
      "Deva Deva", "Kabira", "Tera Ban Jaunga", "Ranjha", "Guli Mata",
      "Pasoori", "O Maahi", "Heeriye", "Mann Meri Jaan", "Agar Tum Saath Ho",
      "Dil Diyan Gallan", "Channa Mereya", "Zaalima", "Ghungroo", "Namo Namo"
    ];

    // Generate remaining 90 songs dynamically, distributed into Telugu, Hindi, and English categories
    const prefixes = ['Neon', 'Midnight', 'Ethereal', 'Static', 'Infinite', 'Velvet', 'Astral', 'Deep', 'Retrograde', 'Cyber', 'Solar', 'Lost', 'Golden', 'Shadow', 'Resonant', 'Dusk', 'Vapour', 'Echoing', 'Whispering', 'Chroma'];
    const roots = ['Grid', 'Horizon', 'Drive', 'Skies', 'Symphony', 'Solitude', 'Mirage', 'Heartbeat', 'Echo', 'Rain', 'Mirrors', 'Frequency', 'Eclipse', 'Fever', 'Beats', 'Nocturne', 'Decay', 'Spark', 'Waves', 'Satellite'];
    const suffixes = ['(Re-record)', '(Live)', '(Julian Demo Session)', '(1984 Tape Mix)', '(Orchestral Sweep)', '(Unplugged)', '(Marcus Beats Edit)', '(Backstage)', ''];

    const spawned: ExtendedSong[] = [];
    let trackCounter = 1;

    for (let i = 1; i <= 90; i++) {
      let title = '';
      let lang: 'english' | 'hindi' | 'telugu' = 'english';
      let albumName = 'Unreleased Vault Archives';
      let cover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600'; // energetic blue/orange concert

      if (i % 3 === 0) {
        // Telugu Song
        lang = 'telugu';
        const titleIndex = (i / 3) % teluguTitles.length;
        title = teluguTitles[titleIndex];
        albumName = 'Tollywood Gold Melodies';
        cover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600';
      } else if (i % 3 === 1) {
        // Hindi Song
        lang = 'hindi';
        const titleIndex = Math.floor(i / 3) % hindiTitles.length;
        title = hindiTitles[titleIndex];
        albumName = 'Bollywood Anthems Showcase';
        cover = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600'; // color equalizer
      } else {
        // English Song
        lang = 'english';
        const prefix = prefixes[i % prefixes.length];
        const root = roots[(i * 3) % roots.length];
        const suffix = suffixes[(i * 7) % suffixes.length];
        title = `${prefix} ${root} ${suffix}`.trim();
        
        if (i <= 30) {
          albumName = 'The Bedroom Transmissions (2019)';
          cover = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400';
        } else if (i <= 60) {
          albumName = 'Rare Cassette Sessions';
          cover = 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=400';
        } else {
          albumName = 'Unreleased Vault Archives';
          cover = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600';
        }
      }

      const randomPlays = (Math.random() * 8 + 0.5).toFixed(1) + 'M';
      const m = Math.floor(Math.random() * 2 + 3); // 3 to 4 min
      const s = Math.floor(Math.random() * 50 + 10);
      const duration = `${m}:${s < 10 ? '0' : ''}${s}`;

      const categories: ('lyrical' | 'instrumental' | 'unreleased' | 'demo')[] = ['demo', 'unreleased', 'lyrical', 'instrumental'];
      const chosenCategory = categories[i % categories.length];

      let songSinger = "Julian Vance";
      let songLyrics = "Lost in the static of a wireless transmission.\nSearching for our frequency in this digital canyon.";
      let songTranslit = "";
      let songTransl = "";
      let songAudio = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${((i % 16) + 1)}.mp3`;

      if (lang === 'telugu' || lang === 'hindi') {
        const regionalMeta = REGIONAL_SONGS_METADATA[title];
        if (regionalMeta) {
          songSinger = regionalMeta.singer;
          songLyrics = regionalMeta.lyrics;
          songTranslit = regionalMeta.transliteration;
          songTransl = regionalMeta.translation;
          songAudio = regionalMeta.audioUrl;
          cover = regionalMeta.cover;
        }
      }

      spawned.push({
        id: `spawn-${i}`,
        title,
        albumTitle: albumName,
        albumCover: cover,
        duration,
        trackNumber: trackCounter++,
        plays: randomPlays,
        category: chosenCategory,
        language: lang,
        audioUrl: songAudio,
        singer: songSinger,
        lyrics: songLyrics,
        transliteration: songTranslit,
        translation: songTransl
      });
    }

    const merged = [...baseSongs, ...spawned];
    setAllSongs(merged);
    setActiveTrack(merged[0]); // default active track
  }, []);

  const activeAlbum = ALBUMS.find(a => a.id === selectedAlbumId) || ALBUMS[0];

  // If active album changes, reset trivia quiz
  useEffect(() => {
    resetQuiz();
  }, [selectedAlbumId]);

  // Setup the audio listeners for real sound playing
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        setPlaybackProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    const handleError = () => {
      console.warn("Audio load failed or blocked for URL:", audio.src);
      if (activeTrack && activeTrack.title === "Naatu Naatu" && audio.src !== "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3") {
        console.log("Gracefully falling back to stable SoundHelix track for Naatu Naatu");
        audio.src = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3";
        audio.load();
        if (isPlaying) {
          audio.play().catch(err => {
            console.warn("Fallback play failed:", err);
          });
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [allSongs, activeTrack, isShuffle, isPlaying]);

  // Sync state (play, pause, source) with HTML5 Audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;

    if (audio.src !== activeTrack.audioUrl) {
      audio.src = activeTrack.audioUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(err => {
          console.warn("Autoplay blocked or playback interrupted:", err);
        });
      } else {
        setPlaybackProgress(0);
      }
    } else {
      if (isPlaying) {
        audio.play().catch(err => {
          console.warn("Playback error:", err);
        });
      } else {
        audio.pause();
      }
    }
  }, [activeTrack, isPlaying]);

  // Sync volume & mute state
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayTrack = (track: ExtendedSong) => {
    if (activeTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
      setPlaybackProgress(0);
    }
  };

  const handleNextTrack = () => {
    if (allSongs.length === 0 || !activeTrack) return;
    const currentIndex = allSongs.findIndex(t => t.id === activeTrack.id);
    let nextIndex = (currentIndex + 1) % allSongs.length;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * allSongs.length);
    }
    setActiveTrack(allSongs[nextIndex]);
    setPlaybackProgress(0);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    if (allSongs.length === 0 || !activeTrack) return;
    const currentIndex = allSongs.findIndex(t => t.id === activeTrack.id);
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = allSongs.length - 1;
    setActiveTrack(allSongs[prevIndex]);
    setPlaybackProgress(0);
    setIsPlaying(true);
  };

  const toggleFavorite = (trackId: string) => {
    if (favoriteIds.includes(trackId)) {
      setFavoriteIds(favoriteIds.filter(id => id !== trackId));
    } else {
      setFavoriteIds([...favoriteIds, trackId]);
    }
  };

  // Trivia submission handlers
  const handleSelectAnswer = (option: string) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const activeQuestion = activeAlbum.triviaQuestions[currentQuestionIndex];
    if (selectedAnswer === activeQuestion.correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setShowHint(false);

    if (currentQuestionIndex < activeAlbum.triviaQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizCompleted(false);
    setShowHint(false);
    setCopiedCode(false);
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText('TRIVIA20');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Filtering songs list
  const filteredSongs = allSongs.filter(song => {
    const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          song.albumTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || song.category === categoryFilter;
    const matchesLanguage = languageFilter === 'all' || song.language === languageFilter;
    return matchesSearch && matchesCategory && matchesLanguage;
  });

  // Pagination bounds
  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = filteredSongs.slice(indexOfFirstSong, indexOfLastSong);
  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);

  const activeQuestion: TriviaQuestion = activeAlbum.triviaQuestions[currentQuestionIndex];

  return (
    <div className="space-y-12 pb-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#3D3A35] dark:text-[#E2E8F0]" id="discography-page">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 pt-6" id="disco-intro">
        <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest block uppercase font-bold">DISCOGRAPHY & VOLUMES</span>
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight leading-tight">
          Velvet Horizon Discography
        </h1>
        <p className="font-serif text-[#6B655C] dark:text-[#94A3B8] text-sm italic">
          "Flipping through our 100+ unreleased rehearsals and studio logs. Explore the tracks, test lyrics, and solve trivia challenges for store rewards!"
        </p>
      </div>

      {/* Album Tabs selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-[#E5DED4] dark:border-[#1E2638] pb-8" id="album-cards-tabs">
        {ALBUMS.map((album) => {
          const isActive = album.id === selectedAlbumId;
          return (
            <button
              key={album.id}
              onClick={() => setSelectedAlbumId(album.id)}
              id={`album-tab-${album.id}`}
              className={`p-4 rounded-2xl flex items-center space-x-4 border text-left transition-all duration-300 cursor-pointer focus:outline-none ${
                isActive
                  ? 'border-[#BC6C25]/50 bg-white/40 shadow-md ring-1 ring-[#BC6C25]/10 dark:border-[#F59E0B]/50 dark:bg-[#1E2638] dark:ring-[#F59E0B]/10'
                  : 'border-white/10 hover:border-[#4A5D4E]/30 bg-[#F2ECE4]/30 dark:border-[#1E2638] dark:hover:border-emerald-500/30 dark:bg-[#111625]/30'
              }`}
            >
              {/* Cover mini thumbnail */}
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[#E5DED4] dark:border-[#2A354F]">
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {isActive && (
                  <div className="absolute inset-0 bg-[#3D3A35]/30 flex items-center justify-center">
                    <Disc className="w-5 h-5 text-[#BC6C25] dark:text-[#F59E0B] animate-spin" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h3 className={`font-serif font-bold text-sm truncate ${isActive ? 'text-[#BC6C25] dark:text-[#F59E0B]' : 'text-[#3D3A35] dark:text-[#E2E8F0]'}`}>
                  {album.title}
                </h3>
                <span className="font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] block font-bold">
                  Released {album.releaseYear}
                </span>
                <span className="font-sans text-[11px] text-[#6B655C] dark:text-[#94A3B8] block truncate mt-0.5">
                  5 Featured Tracks
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Album Spotlight & Trivia columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12" id="album-spotlight-area">
        {/* Left Column: Cover and Song Listing */}
        <div className="lg:col-span-7 space-y-8" id="album-tracks-col">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6" id="album-cover-badge">
            <div className="w-48 h-48 rounded-[24px] overflow-hidden shadow-sm border border-[#E5DED4] dark:border-[#1E2638] flex-shrink-0 relative group">
              <img
                src={activeAlbum.coverUrl}
                alt={activeAlbum.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#3D3A35]/10 group-hover:bg-transparent transition-all pointer-events-none" />
            </div>

            <div className="text-center sm:text-left space-y-3 py-1">
              <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] tracking-widest font-bold">LATEST SELECTION</span>
              <h2 className="font-serif font-bold text-3xl text-[#4A5D4E] dark:text-emerald-400 tracking-tight">
                {activeAlbum.title}
              </h2>
              <span className="inline-block px-3 py-1 font-mono text-[9px] bg-[#F2ECE4] dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#6B655C] dark:text-[#94A3B8] font-bold rounded-full">
                RELEASE YEAR: {activeAlbum.releaseYear}
              </span>
              <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed max-w-md italic font-normal">
                "{activeAlbum.description}"
              </p>

              {/* Album Social Sharing Row */}
              <div className="pt-3 border-t border-[#E5DED4] dark:border-[#1E2638] space-y-2 text-left" id="album-sharing-widget">
                <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-extrabold">SHARE THIS ALBUM</span>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(getAlbumShareText(activeAlbum.title))}&url=${encodeURIComponent(getAlbumShareUrl(activeAlbum.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#F2ECE4]/60 hover:bg-[#E5DED4] dark:bg-[#1E2436] dark:hover:bg-[#2A354F] border border-[#E5DED4] dark:border-[#2A354F] text-[#1DA1F2] transition-all flex items-center justify-center shadow-xs"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-3.5 h-3.5 fill-current" />
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getAlbumShareUrl(activeAlbum.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#F2ECE4]/60 hover:bg-[#E5DED4] dark:bg-[#1E2436] dark:hover:bg-[#2A354F] border border-[#E5DED4] dark:border-[#2A354F] text-[#1877F2] transition-all flex items-center justify-center shadow-xs"
                    title="Share on Facebook"
                  >
                    <Facebook className="w-3.5 h-3.5 fill-current" />
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(getAlbumShareText(activeAlbum.title) + ' ' + getAlbumShareUrl(activeAlbum.id))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-[#F2ECE4]/60 hover:bg-[#E5DED4] dark:bg-[#1E2436] dark:hover:bg-[#2A354F] border border-[#E5DED4] dark:border-[#2A354F] text-[#25D366] transition-all flex items-center justify-center shadow-xs"
                    title="Share on WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyAlbumLink(activeAlbum.id)}
                    className="p-1.5 px-3 rounded-lg bg-[#F2ECE4]/60 hover:bg-[#E5DED4] dark:bg-[#1E2436] dark:hover:bg-[#2A354F] border border-[#E5DED4] dark:border-[#2A354F] text-[10px] font-mono font-bold text-[#BC6C25] dark:text-[#F59E0B] transition-all flex items-center space-x-1 shadow-xs cursor-pointer focus:outline-none"
                    title="Copy Album Link"
                  >
                    {copiedAlbum ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-[9px]">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Link className="w-3 h-3" />
                        <span>COPY LINK</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Album Trivia Quiz Challenge */}
        <div className="lg:col-span-5" id="album-trivia-col">
          <div className="p-6 rounded-[32px] border border-white/20 dark:border-[#1E2638] bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl space-y-6 shadow-sm" id="trivia-panel">
            {/* Trivia Header Badge */}
            <div className="flex items-center justify-between border-b border-[#F0EBE3] dark:border-b-[#1E2638] pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-[#F2ECE4] dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] text-[#BC6C25] dark:text-[#F59E0B]">
                  <Award className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="font-serif font-bold text-base text-[#3D3A35] dark:text-[#E2E8F0]">Album Trivia & Lore</h3>
                  <p className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] uppercase tracking-widest font-bold">{activeAlbum.title}</p>
                </div>
              </div>

              {!quizCompleted && (
                <span className="px-2.5 py-1 rounded-full bg-[#F2ECE4] dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] font-mono text-[10px] text-[#6B655C] dark:text-[#94A3B8] font-bold">
                  Q: {currentQuestionIndex + 1} / {activeAlbum.triviaQuestions.length}
                </span>
              )}
            </div>

            {/* Interactive states */}
            {!quizCompleted ? (
              /* Question render */
              <div className="space-y-6 text-left" id="trivia-question-wrapper">
                <h4 className="font-serif text-sm md:text-base font-bold leading-relaxed text-[#3D3A35] dark:text-[#E2E8F0]">
                  {activeQuestion.question}
                </h4>

                {/* Multiple choice Options list */}
                <div className="space-y-2.5">
                  {activeQuestion.options.map((option) => {
                    const isSelected = selectedAnswer === option;
                    let optionStyle = 'border-[#E5DED4] dark:border-[#1E2638] bg-white dark:bg-[#1E2638] hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] text-[#6B655C] dark:text-[#94A3B8]';

                    if (isAnswerSubmitted) {
                      if (option === activeQuestion.correctAnswer) {
                        optionStyle = 'border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-semibold';
                      } else if (isSelected) {
                        optionStyle = 'border-red-300 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-400 line-through';
                      } else {
                        optionStyle = 'border-[#E5DED4] dark:border-[#1E2638] bg-[#FCFAF7] dark:bg-[#151B2B]/10 text-neutral-400 dark:text-neutral-500 opacity-60 dark:opacity-40';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-[#BC6C25]/50 dark:border-[#F59E0B]/50 bg-[#BC6C25]/10 dark:bg-[#F59E0B]/10 text-[#BC6C25] dark:text-[#F59E0B] font-bold';
                    }

                    return (
                      <button
                        key={option}
                        disabled={isAnswerSubmitted}
                        onClick={() => handleSelectAnswer(option)}
                        className={`w-full p-4 text-xs rounded-xl border text-left cursor-pointer transition-all focus:outline-none ${optionStyle}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {isAnswerSubmitted && option === activeQuestion.correctAnswer && (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          )}
                          {isAnswerSubmitted && isSelected && option !== activeQuestion.correctAnswer && (
                            <X className="w-4 h-4 text-red-600 dark:text-red-450 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Lore Hint Accordion toggle */}
                {showHint ? (
                  <div className="p-3 text-xs bg-[#F2ECE4]/70 dark:bg-[#1E2638]/70 border border-[#E5DED4] dark:border-[#2A354F] text-[#6B655C] dark:text-[#94A3B8] rounded-xl flex items-start space-x-2 animate-fade-in">
                    <Info className="w-4 h-4 text-[#BC6C25] dark:text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <span>{activeQuestion.hint}</span>
                  </div>
                ) : (
                  !isAnswerSubmitted && (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="text-xs font-mono text-[#6B655C] dark:text-[#94A3B8] hover:text-[#BC6C25] dark:hover:text-[#F59E0B] underline decoration-dotted underline-offset-4 tracking-wide cursor-pointer text-left inline-block font-semibold"
                    >
                      Need a hint? View band background info
                    </button>
                  )
                )}

                {/* Question Feedback Explanation */}
                {isAnswerSubmitted && (
                  <div className="p-4 rounded-2xl bg-[#F2ECE4]/50 dark:bg-[#1C2335]/50 border border-[#E5DED4] dark:border-[#1E2638] space-y-2 animate-fade-in">
                    <span className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] font-bold uppercase tracking-widest font-bold">DID YOU KNOW?</span>
                    <p className="font-serif text-xs text-[#6B655C] dark:text-[#94A3B8] leading-relaxed italic">
                      "{activeQuestion.explanation}"
                    </p>
                  </div>
                )}

                {/* Navigation actions */}
                <div className="pt-2">
                  {!isAnswerSubmitted ? (
                    <button
                      disabled={!selectedAnswer}
                      onClick={handleSubmitAnswer}
                      className={`w-full py-3.5 rounded-full text-center font-mono font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center space-x-2 cursor-pointer focus:outline-none ${
                        selectedAnswer
                          ? 'bg-[#4A5D4E] dark:bg-emerald-600 hover:bg-[#5B6F5F] dark:hover:bg-emerald-500 text-white shadow-sm'
                          : 'bg-[#F2ECE4] dark:bg-[#1E2638] text-[#6B655C] dark:text-[#94A3B8] border border-[#E5DED4] dark:border-[#2A354F] cursor-not-allowed'
                      }`}
                    >
                      <span>SUBMIT ANSWER</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3.5 rounded-full text-center font-mono font-bold text-xs tracking-widest uppercase bg-[#4A5D4E] dark:bg-[#1E2638] hover:bg-[#5B6F5F] dark:hover:bg-[#252E44] text-white shadow-sm flex items-center justify-center space-x-2 cursor-pointer focus:outline-none"
                    >
                      <span>
                        {currentQuestionIndex < activeAlbum.triviaQuestions.length - 1
                          ? 'NEXT QUESTION'
                          : 'FINISH TRIVIA GAME'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Quiz Score Summary and Reward payout */
              <div className="text-center py-4 space-y-6" id="trivia-completed-success">
                <div className="relative inline-flex flex-col items-center justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-[#BC6C25]/10 dark:bg-[#F59E0B]/10 border border-[#BC6C25]/30 dark:border-[#F59E0B]/35 flex items-center justify-center text-[#BC6C25] dark:text-[#F59E0B] mb-1 animate-bounce">
                    <Trophy className="w-8 h-8" />
                  </div>
                  <span className="font-mono text-xs text-[#BC6C25] dark:text-[#F59E0B] block uppercase tracking-widest mt-2 font-bold">Lore Quiz Completed</span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-serif font-bold text-xl text-[#3D3A35] dark:text-[#E2E8F0]">
                    Your Score: {quizScore} / {activeAlbum.triviaQuestions.length} Correct
                  </h4>
                  <p className="font-serif text-sm text-[#6B655C] dark:text-[#94A3B8] max-w-xs mx-auto leading-relaxed italic">
                    {quizScore === activeAlbum.triviaQuestions.length
                      ? "Flawless knowledge! You are an absolute super-fan of Velvet Horizon's catalog."
                      : "Great effort! You've unlocked our fan vault rewards."}
                  </p>
                </div>

                {/* Reward payout content */}
                <div className="p-4.5 rounded-3xl border border-[#E5DED4] dark:border-[#1E2638] bg-[#FCFAF7] dark:bg-[#1A2030] text-left space-y-4">
                  <div className="flex items-center space-x-2.5 text-emerald-700 dark:text-emerald-400 font-serif font-bold">
                    <Award className="w-5 h-5 flex-shrink-0" />
                    <span>Reward Unlocked!</span>
                  </div>

                  {/* Promo box */}
                  <div className="space-y-1.5">
                    <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase tracking-wider block font-bold">
                      STORE DISCOUNT COUPON (20% OFF)
                    </span>
                    <div className="flex items-center bg-[#F2ECE4] dark:bg-[#1E2638] border border-[#E5DED4] dark:border-[#2A354F] rounded-xl overflow-hidden py-2 px-4">
                      <span className="font-mono font-bold text-[#BC6C25] dark:text-[#F59E0B] text-sm tracking-widest flex-grow">
                        TRIVIA20
                      </span>
                      <button
                        onClick={copyPromoCode}
                        className="p-1 px-3 bg-white dark:bg-[#1E2638] hover:bg-[#F2ECE4] dark:hover:bg-[#20293D] rounded-lg text-[10px] font-mono text-[#6B655C] dark:text-[#94A3B8] hover:text-[#BC6C25] dark:hover:text-[#F59E0B] cursor-pointer flex items-center space-x-1 border border-[#E5DED4] dark:border-[#2A354F] transition-all"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetQuiz}
                  className="inline-flex items-center space-x-2 text-xs font-mono text-[#6B655C] dark:text-[#94A3B8] hover:text-[#BC6C25] dark:hover:text-[#F59E0B] transition-colors underline decoration-dotted underline-offset-4 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try the quiz again</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Massive 100+ Track listing section */}
      <div className="border border-white/20 dark:border-white/5 rounded-[32px] p-6 sm:p-10 bg-white/30 dark:bg-[#111625]/40 backdrop-blur-xl text-left space-y-6" id="massive-tracklist-hub">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 dark:border-white/5 pb-4">
          <div>
            <h3 className="font-serif font-bold text-xl md:text-2.5xl text-[#3D3A35] dark:text-white">Velvet Horizon Music Archive</h3>
            <p className="font-mono text-[9px] text-[#BC6C25] dark:text-[#F59E0B] tracking-wider uppercase font-semibold block mt-1">
              Browse, search, and play over 100 complete regional and global studio sessions!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search filter box */}
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-450 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search archive..."
                className="pl-9.5 pr-4 py-2 text-xs rounded-full border border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-[#1D2535]/30 outline-none focus:border-[#BC6C25] text-[#3D3A35] dark:text-white max-w-[180px] sm:max-w-xs"
              />
            </div>

            {/* Category selection */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-4 py-2 text-xs rounded-full border border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-[#1D2535]/30 outline-none text-[#3D3A35] dark:text-white cursor-pointer"
            >
              <option value="all">All Genres</option>
              <option value="lyrical">Lyrical Harmonies</option>
              <option value="instrumental">Intricate Instrumental</option>
              <option value="demo">Demo Vault Tape sessions</option>
              <option value="unreleased">Unreleased Tracks</option>
            </select>
          </div>
        </div>

        {/* Dynamic Language Section Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-[#F2ECE4]/50 dark:bg-[#1D2535]/40 p-1.5 rounded-2xl border border-[#E5DED4] dark:border-white/5 w-fit" id="language-selection-tabs">
          {[
            { value: 'all', label: 'All Languages' },
            { value: 'english', label: 'English Hits' },
            { value: 'hindi', label: 'Hindi Melodies' },
            { value: 'telugu', label: 'Telugu Gold' }
          ].map((lang) => {
            const isSelected = languageFilter === lang.value;
            return (
              <button
                key={lang.value}
                onClick={() => {
                  setLanguageFilter(lang.value as any);
                  setCurrentPage(1);
                }}
                className={`px-4.5 py-2 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-[#BC6C25] dark:bg-emerald-500 text-white dark:text-neutral-950 shadow-sm font-extrabold scale-102'
                    : 'text-[#6B655C] hover:text-[#3D3A35] dark:text-[#94A3B8] dark:hover:text-white hover:bg-[#F2ECE4]/70 dark:hover:bg-[#111625]/50'
                }`}
              >
                {lang.label}
              </button>
            );
          })}
        </div>

        {/* Songs List Grid/Rows */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1" id="track-rows-viewport">
          {currentSongs.length === 0 ? (
            <div className="text-center py-20 italic font-serif text-sm text-[#6B655C] dark:text-[#94A3B8]">
              "No archived tracks match your search queries. Try clearing parameters and retry!"
            </div>
          ) : (
            currentSongs.map((track) => {
              const isActive = activeTrack?.id === track.id;
              const isFav = favoriteIds.includes(track.id);
              return (
                <div
                  key={track.id}
                  className={`p-3.5 flex items-center justify-between rounded-2xl border transition-all ${
                    isActive
                      ? 'border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10'
                      : 'border-white/10 hover:border-[#4A5D4E]/20 bg-white/20 dark:bg-[#172033]/20'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <button
                      onClick={() => togglePlayTrack(track)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                        isActive
                          ? 'bg-emerald-500 text-white dark:text-[#0c1322]'
                          : 'bg-[#F2ECE4] dark:bg-[#1D2436] text-[#6B655C] hover:bg-[#E5DED4]'
                      }`}
                    >
                      {isActive && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
 
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className={`font-serif font-bold text-sm block truncate ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#3D3A35] dark:text-[#CBD5E1]'}`}>
                          {track.title}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-bold uppercase tracking-widest leading-none ${
                          track.language === 'telugu' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          track.language === 'hindi' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {track.language}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-[#6B655C] dark:text-[#94A3B8] uppercase block tracking-wider mt-1">
                        ALBUM: {track.albumTitle} • Artist: {track.singer || 'Velvet Horizon'} • Category: {track.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <span className="hidden sm:inline font-mono text-[11px] text-neutral-450 uppercase">{track.plays} STREAMS</span>
                    <span className="font-mono text-xs text-neutral-400">{track.duration}</span>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(track.id)}
                      className="p-1 rounded text-neutral-400 hover:text-red-500 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current text-red-500' : ''}`} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2.5 pt-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E5DED4] dark:border-white/10 text-xs font-mono disabled:opacity-40"
            >
              PREVIOUS
            </button>
            <span className="font-mono text-xs text-[#6B655C] dark:text-[#94A3B8]">
              PAGE {currentPage} OF {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="px-3 py-1.5 rounded-lg border border-[#E5DED4] dark:border-white/10 text-xs font-mono disabled:opacity-40"
            >
              NEXT
            </button>
          </div>
        )}
      </div>

      {/* Floating Glassmorphic Music Player Controller */}
      {activeTrack && (
        <div 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-5xl p-4.5 rounded-[24px] border border-emerald-500/20 bg-gradient-to-r from-[#070b15]/95 via-[#0A1525]/95 to-[#0b1712]/95 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 scale-100 animate-slide-up transition-all text-white"
          id="floating-music-player-console"
        >
          {/* Left Track Branding & Favorite */}
          <div className="flex items-center space-x-3.5 text-left min-w-0 md:w-1/4">
            {/* Spinning Album Cover Vinyl */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 animate-spin border border-emerald-500/25 shadow-lg" style={{ animationDuration: isPlaying ? '6s' : '0s' }}>
              <img src={activeTrack.albumCover} alt="Cover" className="w-full h-full object-cover select-none" />
              <div className="absolute inset-0 bg-black/10" />
              {/* Vinyl center pinhole */}
              <div className="absolute inset-[38%] bg-[#070b15] border border-emerald-500/20 rounded-full" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-serif font-extrabold text-sm text-emerald-450 block truncate text-emerald-400">
                  {activeTrack.title}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-widest leading-none ${
                  activeTrack.language === 'telugu' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  activeTrack.language === 'hindi' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {activeTrack.language}
                </span>
              </div>
              <span className="font-mono text-[9px] text-[#94A3B8] block truncate uppercase mt-0.5">
                {activeTrack.albumTitle}
              </span>
            </div>

            <button
              onClick={() => toggleFavorite(activeTrack.id)}
              className="p-1 rounded text-[#94A3B8] hover:text-red-500 transition-colors cursor-pointer focus:outline-none"
              title="Add to Favorites"
            >
              <Heart className={`w-4 h-4 ${favoriteIds.includes(activeTrack.id) ? 'fill-current text-red-500' : ''}`} />
            </button>

            <button
              onClick={() => setShowLyricsModal(true)}
              className="p-1 rounded text-[#94A3B8] hover:text-emerald-400 transition-colors cursor-pointer focus:outline-none"
              title="Lyrics, Pronunciation & English Translation"
            >
              <FileText className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Central Controls with Playhead Scrubber */}
          <div className="flex flex-col items-center flex-grow space-y-2.5 md:max-w-2xl">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                className={`p-1 rounded transition-colors cursor-pointer ${isShuffle ? 'text-emerald-400' : 'text-neutral-500 hover:text-white'}`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button 
                onClick={handlePrevTrack} 
                className="p-1 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                title="Previous Track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-emerald-500 hover:bg-emerald-400 text-[#070b15] rounded-full hover:scale-105 active:scale-95 transition-all shadow-md focus:outline-none cursor-pointer"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button 
                onClick={handleNextTrack} 
                className="p-1 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                title="Next Track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-1 rounded transition-colors cursor-pointer ${isRepeat ? 'text-emerald-400' : 'text-neutral-500 hover:text-white'}`}
                title="Repeat Track"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Playhead Scrubber */}
            <div className="flex items-center space-x-3 w-full">
              <span className="font-mono text-[10px] text-[#94A3B8] w-9 text-right select-none">
                {formatTime(currentTime)}
              </span>

              <div 
                onClick={handleSeek}
                className="relative flex-grow h-1.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer transition-all group"
                title="Click to seek"
              >
                <div
                  className="absolute left-0 bottom-0 top-0 bg-emerald-400 rounded-full group-hover:bg-emerald-350"
                  style={{ width: `${playbackProgress}%` }}
                />
                <div 
                  className="absolute w-3 h-3 bg-white border border-emerald-500 rounded-full -top-[3px] -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `${playbackProgress}%` }}
                />
              </div>

              <span className="font-mono text-[10px] text-[#94A3B8] w-9 text-left select-none">
                {activeTrack.duration}
              </span>
            </div>
          </div>

          {/* Volume Control right */}
          <div className="hidden md:flex items-center space-x-3 w-1/4 justify-end">
            <button
              onClick={() => setShowLyricsModal(true)}
              className="p-1.5 px-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all text-[11px] font-mono font-bold flex items-center space-x-1 mr-2"
              title="View Lyrics, Pronunciation & Translations"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>LYRICS & TRANSLATION</span>
            </button>

            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="p-1.5 text-[#94A3B8] hover:text-white cursor-pointer focus:outline-none"
              title={isMuted ? "Unmute" : "Mute"}
            >
              <Volume2 className="w-4.5 h-4.5" />
            </button>
            
            <div 
              onClick={handleVolumeChange}
              className="w-24 h-1.5 bg-white/15 hover:bg-white/25 rounded-full cursor-pointer relative group transition-all"
              title={`Volume: ${isMuted ? 0 : Math.round(volume)}%`}
            >
              <div
                className="absolute left-0 bottom-0 top-0 bg-emerald-400 rounded-full group-hover:bg-emerald-350"
                style={{ width: isMuted ? '0%' : `${volume}%` }}
              />
              <div 
                className="absolute w-2.5 h-2.5 bg-white rounded-full -top-[2px] -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: isMuted ? '0%' : `${volume}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Lyrics & Translation Overlay Drawer */}
      {showLyricsModal && activeTrack && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[32px] border border-emerald-500/30 bg-[#070b15]/95 text-white flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={activeTrack.albumCover} alt="Cover" className="w-14 h-14 rounded-xl object-cover border border-emerald-500/20" />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-emerald-400">{activeTrack.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">{activeTrack.language}</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">Artist/Singer: <span className="text-neutral-200 font-semibold">{activeTrack.singer || 'Velvet Horizon'}</span></p>
                </div>
              </div>
              <button 
                onClick={() => setShowLyricsModal(false)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 text-left custom-scrollbar">
              {activeTrack.lyrics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                  {/* Original script column */}
                  <div className="space-y-3.5 bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center space-x-2 text-amber-400">
                      <FileText className="w-4 h-4" />
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider">Original Lyrics</h4>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line font-serif text-neutral-250 italic">
                      {activeTrack.lyrics}
                    </p>
                  </div>

                  {/* Transliteration column */}
                  <div className="space-y-3.5 bg-white/5 p-5 rounded-2xl border border-white/5">
                    <div className="flex items-center space-x-2 text-indigo-400">
                      <Globe className="w-4 h-4" />
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider">Pronunciation</h4>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line font-serif text-neutral-250">
                      {activeTrack.transliteration || activeTrack.lyrics}
                    </p>
                  </div>

                  {/* English Translation column */}
                  <div className="space-y-3.5 bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                    <div className="flex items-center space-x-2 text-emerald-450">
                      <Info className="w-4 h-4" />
                      <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">English Translation</h4>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-line font-serif text-emerald-100">
                      {activeTrack.translation || "English lyrical content matches pronunciation listed. Relive classical instrumental melodies."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-450 italic">
                  No lyrics metadata configured for this song category. Play the track to enjoy classical instrumentation.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-black/40 border-t border-white/5 text-center">
              <p className="font-mono text-[10px] text-neutral-500">
                Velvet Horizon Sound Log System • Regional Showcase & Translations
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
