import { Album, MerchItem, TourDate, BlogPost, FAQ, LessonTutor } from './types';

export const BAND_BIO = {
  name: "Velvet Horizon",
  genre: "Indie Electronica / Synth-Rock",
  origin: "Brooklyn, NY",
  formedYear: 2018,
  about: "Formed in the neon-lit basement studios of Brooklyn, Velvet Horizon fuses the raw energy of late-90s indie rock with shimmering retro synthesizers and hypnotic electronic beats. Celebrated for their electric, highly visual onstage presence and intricate studio craftsmanship, the quartet has spent the last eight years carving out a signature atmospheric landscape. Synthesizing emotive lyricism, lush vintage gears, and drive-heavy basslines, they continue to push sonic boundaries and captivate fans worldwide.",
  members: [
    {
      name: "Julian Vance",
      role: "Lead Vocals & Synthesizers",
      bio: "Julian is the primary lyricist and songwriter. Armed with a vintage Roland Juno and an expressive vocal range, he directs the atmospheric and melodic direction of Velvet Horizon.",
      imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Elena Rostova",
      role: "Lead Guitar & Backing Vocals",
      bio: "Elena's atmospheric delayed riffs and high-gain feedback soundscapes give Velvet Horizon their distinctive rock edge. Originally from Prague, she excels at crafting soaring, emotional solos.",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Marcus \"Rex\" Thorn",
      role: "Bass Guitar & Custom Beats",
      bio: "Rex holds down the low-end, writing driving, melodic basslines and programming deep drum machines. His keen production eye keeps the band's rhythm tight, heavy, and danceable.",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600"
    },
    {
      name: "Chloe Mercer",
      role: "Drums & Auxiliary Percussion",
      bio: "Chloe brings explosive energy and complex rhythmic patterns. Blending digital drum pads with warm, acoustic drums, she creates custom polyrhythmic drives for every single record.",
      imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600"
    }
  ]
};

export const ALBUMS: Album[] = [
  {
    id: "neon-whispers",
    title: "Neon Whispers",
    releaseYear: 2022,
    coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=600",
    description: "The breakout synth-wave masterpiece that established global listeners. Warm, analog, and deeply nostalgic, 'Neon Whispers' explores late-night city drives, lost connections, and neon-lit romance.",
    tracks: [
      { id: "nw-1", title: "Sunset Grid", duration: "3:45", trackNumber: 1, plays: "18.4M" },
      { id: "nw-2", title: "Retrograde", duration: "4:12", trackNumber: 2, plays: "12.1M" },
      { id: "nw-3", title: "Echoes in Tokyo", duration: "3:55", trackNumber: 3, plays: "24.2M" },
      { id: "nw-4", title: "Midnight Drive", duration: "5:01", trackNumber: 4, plays: "9.7M" },
      { id: "nw-5", title: "Static Waves", duration: "3:30", trackNumber: 5, plays: "6.3M" }
    ],
    triviaQuestions: [
      {
        id: "nw-q1",
        question: "In which city did Julian write 'Echoes in Tokyo' during a late-night rainstorm?",
        options: ["London", "Tokyo", "Berlin", "New York"],
        correctAnswer: "Tokyo",
        hint: "Look closely at the song's title for a very direct clue!",
        explanation: "Julian wrote the lyrics while stranded at a tiny noodle bar in Shibuya during a historic summer downpour in Tokyo."
      },
      {
        id: "nw-q2",
        question: "What rare analog synthesizer was used for the main bassline in 'Retrograde'?",
        options: ["Roland Juno-106", "Minimoog Model D", "Korg MS-20", "Yamaha DX7"],
        correctAnswer: "Roland Juno-106",
        hint: "It's Julian's favorite Japanese polyphonic synth from 1984.",
        explanation: "The warm, pulsing bassline of Retrograde was crafted entirely on a vintage Roland Juno-106 synthesizer."
      },
      {
        id: "nw-q3",
        question: "What secret background sound is captured at the very beginning of the opening track 'Sunset Grid'?",
        options: ["Running water", "City traffic and police sirens", "Vinyl crackle and coffee shop ambient noises", "Forest crickets"],
        correctAnswer: "Vinyl crackle and coffee shop ambient noises",
        hint: "We set up a microphone inside our favorite local Brooklyn espresso bar.",
        explanation: "To give 'Sunset Grid' an intimate, high-texture intro, Marcus recorded coffee bean grinding and conversations in Brooklyn."
      }
    ]
  },
  {
    id: "shadows-and-dust",
    title: "Shadows & Dust",
    releaseYear: 2024,
    coverUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=600",
    description: "A heavier, melancholic introspection blending post-punk delays with heavy sub-bass currents. Reflective of the band's demanding tour experiences and experimental instrumentation.",
    tracks: [
      { id: "sd-1", title: "Nocturnal", duration: "4:08", trackNumber: 1, plays: "11.2M" },
      { id: "sd-2", title: "Pale Blue Light", duration: "3:42", trackNumber: 2, plays: "15.9M" },
      { id: "sd-3", title: "Ghost In The Machine", duration: "4:30", trackNumber: 3, plays: "8.8M" },
      { id: "sd-4", title: "Velvet Skyline", duration: "3:58", trackNumber: 4, plays: "13.2M" },
      { id: "sd-5", title: "After the Rain", duration: "5:20", trackNumber: 5, plays: "7.4M" }
    ],
    triviaQuestions: [
      {
        id: "sd-q1",
        question: "Which track from 'Shadows & Dust' features an actual recording of Elena's vintage 1965 Fender Stratocaster?",
        options: ["Nocturnal", "Pale Blue Light", "Ghost In The Machine", "After the Rain"],
        correctAnswer: "Pale Blue Light",
        hint: "It has a shimmering, jangly chorus riff that sounds like running water.",
        explanation: "Elena bought her 1965 Stratocaster in Prague and played it through a tape delay for the soaring chorus of 'Pale Blue Light'."
      },
      {
        id: "sd-q2",
        question: "The moody album cover is based on photographs taken in which global destination?",
        options: ["Mojave Desert", "Iceland's Black Sand Beaches", "Atacama Desert", "The Scottish Highlands"],
        correctAnswer: "Iceland's Black Sand Beaches",
        hint: "Think of monochromatic volcanic dust, deep fog, and dramatic wave crashes.",
        explanation: "The cover photo was shot by Julian on a misty morning at Vik Black Sand Beach in Iceland."
      },
      {
        id: "sd-q3",
        question: "How long did it take the band to record 'After the Rain' in its final form in the studio?",
        options: ["Exactly 1 Take", "5 Days of editing", "2 Weeks of tracking", "3 Months"],
        correctAnswer: "Exactly 1 Take",
        hint: "It was a lightning-in-a-bottle moment where everyone played completely live in the room.",
        explanation: "'After the Rain' was captured in precisely one live take at midnight during their final studio session, keeping the raw imperfections."
      }
    ]
  },
  {
    id: "elysian-fields",
    title: "Elysian Fields",
    releaseYear: 2026,
    coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
    description: "Their latest, highly anticipated masterpiece. Radiating with crisp drums, cinematic orchestral pads, and a majestic solar-inspired sonic architecture representing hope and rebirth.",
    tracks: [
      { id: "ef-1", title: "Golden Hour", duration: "3:50", trackNumber: 1, plays: "21.6M" },
      { id: "ef-2", title: "Astral Plane", duration: "4:15", trackNumber: 2, plays: "14.8M" },
      { id: "ef-3", title: "Resonance", duration: "3:35", trackNumber: 3, plays: "10.1M" },
      { id: "ef-4", title: "Silent Symphony", duration: "4:45", trackNumber: 4, plays: "7.9M" },
      { id: "ef-5", title: "Infinite Echo", duration: "5:10", trackNumber: 5, plays: "11.3M" }
    ],
    triviaQuestions: [
      {
        id: "ef-q1",
        question: "What inspired Julian's lush vocals and cosmic lyrics on 'Astral Plane'?",
        options: ["An old science fiction book", "A stargazing trip in the Arizona desert", "Watching a lunar eclipse from a high-rise", "A dream about deep ocean exploration"],
        correctAnswer: "A stargazing trip in the Arizona desert",
        hint: "It occurred during the Perseid Meteor Shower under ultra-dark night skies.",
        explanation: "Julian camped out in Sedona, Arizona during a meteor shower, which immediately catalyzed the celestial lyrics for 'Astral Plane'."
      },
      {
        id: "ef-q2",
        question: "Which acoustic percussion instrument did Chloe study and record for 'Silent Symphony'?",
        options: ["Vibraphone", "Cajon", "Bongos", "Acoustic Marimba"],
        correctAnswer: "Vibraphone",
        hint: "It uses metal bars driven by spinning fans to create a warbling, ethereal vibraphone sustain.",
        explanation: "Chloe rented a vintage 1940s vibraphone, learning to play it with soft mallets to give the ballad its haunting bell sound."
      },
      {
        id: "ef-q3",
        question: "What major scale coordinates the signature climax chord progression of 'Golden Hour'?",
        options: ["A Major", "G Major", "D Major", "F Major"],
        correctAnswer: "G Major",
        hint: "It is a standard warm scale often described by musicians as 'pure sunshine'.",
        explanation: "The euphoric climax of Golden Hour opens up into a sweeping G Major scale, reflecting a majestic sunset vibe."
      }
    ]
  }
];

export const TOUR_DATES: TourDate[] = [
  {
    id: "tour-1",
    date: "July 12",
    month: "JUL",
    day: "12",
    year: "2026",
    dayOfWeek: "SUNDAY",
    venue: "Music Hall of Williamsburg",
    city: "Brooklyn, NY",
    country: "USA",
    ticketStatus: "Sold Out",
    price: 45
  },
  {
    id: "tour-2",
    date: "July 18",
    month: "JUL",
    day: "18",
    year: "2026",
    dayOfWeek: "SATURDAY",
    venue: "The Fillmore",
    city: "San Francisco, CA",
    country: "USA",
    ticketStatus: "Selling Fast",
    price: 50
  },
  {
    id: "tour-3",
    date: "July 22",
    month: "JUL",
    day: "22",
    year: "2026",
    dayOfWeek: "WEDNESDAY",
    venue: "The Vic Theatre",
    city: "Chicago, IL",
    country: "USA",
    ticketStatus: "Available",
    price: 40
  },
  {
    id: "tour-4",
    date: "August 05",
    month: "AUG",
    day: "05",
    year: "2026",
    dayOfWeek: "WEDNESDAY",
    venue: "KOKO London",
    city: "London",
    country: "UK",
    ticketStatus: "Sold Out",
    price: 55
  },
  {
    id: "tour-5",
    date: "August 09",
    month: "AUG",
    day: "09",
    year: "2026",
    dayOfWeek: "SUNDAY",
    venue: "Lollapalooza Berlin",
    city: "Berlin",
    country: "Germany",
    ticketStatus: "Available",
    price: 95
  },
  {
    id: "tour-6",
    date: "August 14",
    month: "AUG",
    day: "14",
    year: "2026",
    dayOfWeek: "FRIDAY",
    venue: "La Cigale",
    city: "Paris",
    country: "France",
    ticketStatus: "Selling Fast",
    price: 48
  },
  {
    id: "tour-7",
    date: "September 02",
    month: "SEP",
    day: "02",
    year: "2026",
    dayOfWeek: "WEDNESDAY",
    venue: "Liquidroom",
    city: "Tokyo",
    country: "Japan",
    ticketStatus: "Available",
    price: 60
  },
  {
    id: "tour-8",
    date: "July 26",
    month: "JUL",
    day: "26",
    year: "2026",
    dayOfWeek: "SUNDAY",
    venue: "The Wiltern",
    city: "Los Angeles, CA",
    country: "USA",
    ticketStatus: "Selling Fast",
    price: 55
  },
  {
    id: "tour-9",
    date: "August 20",
    month: "AUG",
    day: "20",
    year: "2026",
    dayOfWeek: "THURSDAY",
    venue: "Paradiso",
    city: "Amsterdam",
    country: "Netherlands",
    ticketStatus: "Available",
    price: 50
  },
  {
    id: "tour-10",
    date: "September 08",
    month: "SEP",
    day: "08",
    year: "2026",
    dayOfWeek: "TUESDAY",
    venue: "Billboard Live Osaka",
    city: "Osaka",
    country: "Japan",
    ticketStatus: "Available",
    price: 65
  },
  {
    id: "tour-11",
    date: "September 15",
    month: "SEP",
    day: "15",
    year: "2026",
    dayOfWeek: "TUESDAY",
    venue: "Showbox SoDo",
    city: "Seattle, WA",
    country: "USA",
    ticketStatus: "Available",
    price: 42
  },
  {
    id: "tour-12",
    date: "October 04",
    month: "OCT",
    day: "04",
    year: "2026",
    dayOfWeek: "SUNDAY",
    venue: "Stubb's Waller Creek Amphitheater",
    city: "Austin, TX",
    country: "USA",
    ticketStatus: "Available",
    price: 48
  },
  {
    id: "tour-13",
    date: "October 10",
    month: "OCT",
    day: "10",
    year: "2026",
    dayOfWeek: "SATURDAY",
    venue: "Forum Karlín",
    city: "Prague",
    country: "Czech Republic",
    ticketStatus: "Selling Fast",
    price: 45
  },
  {
    id: "tour-14",
    date: "October 18",
    month: "OCT",
    day: "18",
    year: "2026",
    dayOfWeek: "SUNDAY",
    venue: "O2 Forum Kentish Town",
    city: "London",
    country: "UK",
    ticketStatus: "Available",
    price: 52
  },
  {
    id: "tour-15",
    date: "November 02",
    month: "NOV",
    day: "02",
    year: "2026",
    dayOfWeek: "MONDAY",
    venue: "Columbiahalle",
    city: "Berlin",
    country: "Germany",
    ticketStatus: "Available",
    price: 48
  },
  {
    id: "tour-16",
    date: "November 08",
    month: "NOV",
    day: "08",
    year: "2026",
    dayOfWeek: "SUNDAY",
    venue: "Le Trianon",
    city: "Paris",
    country: "France",
    ticketStatus: "Available",
    price: 46
  },
  {
    id: "tour-17",
    date: "November 14",
    month: "NOV",
    day: "14",
    year: "2026",
    dayOfWeek: "SATURDAY",
    venue: "Webster Hall",
    city: "New York, NY",
    country: "USA",
    ticketStatus: "Selling Fast",
    price: 50
  },
  {
    id: "tour-18",
    date: "November 21",
    month: "NOV",
    day: "21",
    year: "2026",
    dayOfWeek: "SATURDAY",
    venue: "Hollywood Palladium",
    city: "Los Angeles, CA",
    country: "USA",
    ticketStatus: "Available",
    price: 55
  },
  {
    id: "tour-19",
    date: "December 05",
    month: "DEC",
    day: "05",
    year: "2026",
    dayOfWeek: "SATURDAY",
    venue: "Toyosu PIT",
    city: "Tokyo",
    country: "Japan",
    ticketStatus: "Available",
    price: 65
  },
  {
    id: "tour-20",
    date: "December 12",
    month: "DEC",
    day: "12",
    year: "2026",
    dayOfWeek: "SATURDAY",
    venue: "Zepp Osaka Bayside",
    city: "Osaka",
    country: "Japan",
    ticketStatus: "Available",
    price: 60
  }
];

export const MERCH_STORE: MerchItem[] = [
  {
    id: "merch-1",
    name: "Velvet Horizon Classic Logo Tee",
    price: 35,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
    description: "Premium heavy-weight 100% organic cotton tee featuring the iconic Velvet Horizon sunset wave logo printed in fading pastel hues. Boxy fit, pre-shrunk, made in Brooklyn.",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    rating: 4.9,
    stock: 24,
    isFeatured: true
  },
  {
    id: "merch-2",
    name: "Elysian Fields Limited Gatefold Vinyl",
    price: 45,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1539628399213-d6aa19c934e4?auto=format&fit=crop&q=80&w=600",
    description: "180g gold-splattered translucent solar vinyl. Features exclusive gatefold jacket, matte varnish finish, an 8-page booklet filled with lyric sheets, digital download card, and art prints.",
    rating: 5.0,
    stock: 12,
    isFeatured: true
  },
  {
    id: "merch-3",
    name: "Nocturnal Embroidered Pullover Hoodie",
    price: 75,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
    description: "Ultra-soft premium cotton loopback French Terry hoodie. Features a subtle high-density dark-on-dark 'Nocturnal' wave chest embroidery and deep fleece-lined kangaroo hood.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    stock: 8,
    isFeatured: true
  },
  {
    id: "merch-4",
    name: "Neon Whispers 1984 Cassette Tape",
    price: 18,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&q=80&w=600",
    description: "An authentic vintage neon pink cassette tape shell. Features custom foldout J-Card artwork, and full-album warm analog tape master tracks. Includes instant high-fidelity wav files download.",
    rating: 4.7,
    stock: 15,
    isFeatured: false
  },
  {
    id: "merch-5",
    name: "Retrograde Tour Canvas Tote Bag",
    price: 25,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=600",
    description: "Heavy-duty 14oz black canvas utility bag with reinforced handles. Screenprinted with full 2026 worldwide schedule on the back and glowing abstract moon chart on the front face.",
    rating: 4.9,
    stock: 45,
    isFeatured: false
  },
  {
    id: "merch-6",
    name: "Studio Wave Laser-Etched Keyring",
    price: 12,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1590534247854-e97d5e3feef6?auto=format&fit=crop&q=80&w=600",
    description: "A highly resilient laser-cut matte black steel keyring styled into Julian's signature synthesizer soundwaves. High precision hardware rings, packaged in a custom gift tin.",
    rating: 4.6,
    stock: 110,
    isFeatured: false
  },
  {
    id: "merch-7",
    name: "Dusk Horizon Acid-Wash Tee",
    price: 38,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600",
    description: "Vintage charcoal acid-wash tee featuring custom celestial orange embroidery on the left chest. Soft-washed, pre-shrunk heavyweight cotton.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    stock: 14,
    isFeatured: true
  },
  {
    id: "merch-8",
    name: "Acoustic Whispers Live Vinyl",
    price: 42,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=600",
    description: "Unplugged acoustic recordings from our winter sessions, pressed on heavy cherry-red vinyl with full-color insert and handwritten liner notes.",
    rating: 4.9,
    stock: 15,
    isFeatured: true
  },
  {
    id: "merch-9",
    name: "Velvet Horizon Snapback Cap",
    price: 28,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600",
    description: "Structured 5-panel retro snapback with Julian's signature synthesizer waveforms embroidered in metallic gold thread.",
    sizes: ["One Size"],
    rating: 4.7,
    stock: 32,
    isFeatured: false
  },
  {
    id: "merch-10",
    name: "Modular Echoes Felt Slipmat",
    price: 15,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?auto=format&fit=crop&q=80&w=600",
    description: "Premium 16oz density felt slipmat featuring a detailed white diagram layout of our vintage modular synth setup. Smooth scratch surface.",
    rating: 4.8,
    stock: 100,
    isFeatured: false
  },
  {
    id: "merch-11",
    name: "Golden Hour Enamel Pin Set",
    price: 16,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1619134778706-7015533a6150?auto=format&fit=crop&q=80&w=600",
    description: "A gorgeous set of three high-density cloisonné enamel pins representing Sunset Waves, Synth Knobs, and Elena's legendary Delay Pedal.",
    rating: 4.9,
    stock: 150,
    isFeatured: true
  },
  {
    id: "merch-12",
    name: "Decade of Resonance CD Boxset",
    price: 50,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1611001716885-b3402558a62b?auto=format&fit=crop&q=80&w=600",
    description: "A comprehensive 4-CD collection of rare live recordings, demo cassette masters, and high-fidelity ambient stems. Includes a 48-page photo booklet.",
    rating: 5.0,
    stock: 25,
    isFeatured: true
  },
  {
    id: "merch-13",
    name: "Nocturnal Knit Beanie",
    price: 22,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1576871337622-98d48d435350?auto=format&fit=crop&q=80&w=600",
    description: "Double-layered hyper-insulated knit beanie with a custom woven velvet patch. Keeps you warm during cold late-night outdoor concerts.",
    sizes: ["One Size"],
    rating: 4.6,
    stock: 45,
    isFeatured: false
  },
  {
    id: "merch-14",
    name: "Resonance Heat-Active Mug",
    price: 18,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600",
    description: "Matte black ceramic mug. When hot liquid is added, a vibrant neon sunrise waveform graphic magically reveals itself around the body.",
    rating: 4.5,
    stock: 50,
    isFeatured: false
  },
  {
    id: "merch-15",
    name: "Elena's Signature Guitar Pick Set",
    price: 10,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1605020420620-20c943cc4669?auto=format&fit=crop&q=80&w=600",
    description: "A set of 10 custom heavy celluloid guitar picks featuring signature delay setups and golden wave graphics. Housed in a slides-open metal tin.",
    rating: 4.9,
    stock: 200,
    isFeatured: false
  },
  {
    id: "merch-16",
    name: "Elysian Fields Reflective Windbreaker",
    price: 85,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600",
    description: "Reflective, water-repellent windbreaker. Featuring neon coral accents and a giant hyper-reflective sunset design printed on the back panel.",
    sizes: ["S", "M", "L", "XL"],
    rating: 4.9,
    stock: 18,
    isFeatured: true
  },
  {
    id: "merch-17",
    name: "Neon Whispers Glow Sticker Pack",
    price: 5,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1572375995301-40182c916859?auto=format&fit=crop&q=80&w=600",
    description: "Pack of 5 high-grade weatherproof die-cut stickers. Includes elements that glow brightly under UV blacklights.",
    rating: 4.7,
    stock: 300,
    isFeatured: false
  },
  {
    id: "merch-18",
    name: "Solar Flares Double Tape Set",
    price: 25,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&q=80&w=600",
    description: "Exclusive double cassette box set loaded with direct desk feeds from our tour sound checks and improvisational guitar loops.",
    rating: 4.8,
    stock: 10,
    isFeatured: false
  },
  {
    id: "merch-19",
    name: "Analog Dreams Leatherette Journal",
    price: 20,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600",
    description: "Eco-friendly synthetic leather notebook with 160 pages of heavy cream dotted paper. Ideal for writing down lyrics, tab charts, or synth patches.",
    rating: 4.8,
    stock: 40,
    isFeatured: false
  },
  {
    id: "merch-20",
    name: "Fading Suns Sherpa Fleece",
    price: 90,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=600",
    description: "Thick double-sided high-pile sherpa fleece jacket with a custom forest green and rust sunset color-block design.",
    sizes: ["M", "L", "XL", "XXL"],
    rating: 4.9,
    stock: 12,
    isFeatured: true
  },
  {
    id: "merch-21",
    name: "Vintage Seatbelt Guitar Strap",
    price: 35,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600",
    description: "Heavy-duty seatbelt nylon guitar strap in retro desert orange, fitted with embossed hand-stitched leather attachment points.",
    rating: 4.9,
    stock: 35,
    isFeatured: false
  },
  {
    id: "merch-22",
    name: "Sunset Waves Insulated Flask",
    price: 30,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
    description: "Double-wall vacuum sealed 32oz bottle. Maintains your beverage iced cold for 24 hours or steaming hot for 12 hours.",
    rating: 4.7,
    stock: 45,
    isFeatured: false
  },
  {
    id: "merch-23",
    name: "Resonance Ribbed Cotton Socks",
    price: 15,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=600",
    description: "Premium combed cotton crew socks with athletic ribbing and compression arches. Features embroidered logo waves.",
    sizes: ["S/M", "L/XL"],
    rating: 4.4,
    stock: 60,
    isFeatured: false
  },
  {
    id: "merch-24",
    name: "Resonance Remixed Gatefold EP",
    price: 28,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=600",
    description: "12-inch neon green vinyl containing club remixes of our biggest singles, curated and masterfully pressed on high-density discs.",
    rating: 4.8,
    stock: 30,
    isFeatured: false
  },
  {
    id: "merch-25",
    name: "Horizon Waves Embossed Phone Case",
    price: 25,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=600",
    description: "Shock-absorbing TPU phone case with a gorgeous, high-texture raised line art representation of our classic horizon wave graphic.",
    rating: 4.6,
    stock: 55,
    isFeatured: false
  },
  {
    id: "merch-26",
    name: "Golden Hour Crewneck Sweatshirt",
    price: 65,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=600",
    description: "Ultra-heavy loops fleece crewneck sweatshirt in a beautiful sunflower gold dye. Ribbed cuffs and high-density vintage logo print.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 5.0,
    stock: 22,
    isFeatured: true
  },
  {
    id: "merch-27",
    name: "Midnight Sessions Sunset Vinyl",
    price: 32,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1583244154143-6c175374ffc1?auto=format&fit=crop&q=80&w=600",
    description: "A spectacular custom split color (black and orange) vinyl EP capturing our late-night studio jam sessions and unreleased synthesizers.",
    rating: 4.9,
    stock: 18,
    isFeatured: true
  },
  {
    id: "merch-28",
    name: "Elysian Fields Screenprinted Poster",
    price: 20,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600",
    description: "18x24 screenprinted heavy archival paper poster. Features intricate hand-drawn solar alignments and metallic copper details.",
    rating: 4.9,
    stock: 100,
    isFeatured: false
  },
  {
    id: "merch-29",
    name: "Vaporwave Pastel Tie-Dye Tee",
    price: 36,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=80&w=600",
    description: "Individually hand-dyed swirl tee in pastel lilac, seafoam, and peach. Printed with a clean neon pink sunset logo.",
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.7,
    stock: 19,
    isFeatured: false
  },
  {
    id: "merch-30",
    name: "Acoustic Sessions Golden Tape",
    price: 16,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1618609378039-b572f64c5b42?auto=format&fit=crop&q=80&w=600",
    description: "A gorgeous retro gold metallic cassette tape shell. Loaded with acoustic guitar overlays, warm vocals, and real string quartets.",
    rating: 4.8,
    stock: 22,
    isFeatured: false
  },
  {
    id: "merch-31",
    name: "Nocturnal Leather Card Wallet",
    price: 35,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600",
    description: "Sleek full-grain black leather cardholder with a subtle debossed synthesizer soundwave pattern and standard RFID blocking.",
    rating: 4.9,
    stock: 20,
    isFeatured: false
  },
  {
    id: "merch-32",
    name: "Nocturnal Satin Coach Jacket",
    price: 80,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=600",
    description: "Premium matte satin coach jacket with warm quilted inner lining and heavy snaps. Featuring solid sleeve print accents.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    stock: 10,
    isFeatured: false
  },
  {
    id: "merch-33",
    name: "Retrograde Live Album CD",
    price: 15,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1513829096999-497860229414?auto=format&fit=crop&q=80&w=600",
    description: "Standard CD Digipak capturing our energetic headline concert live in Chicago. Includes an exclusive 12-page tour photography insert.",
    rating: 4.6,
    stock: 40,
    isFeatured: false
  },
  {
    id: "merch-34",
    name: "Solar Flare Embroidered Patch",
    price: 6,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=600",
    description: "3-inch round embroidered patch with heat-activated iron-on backing. Perfect for jackets, denim vests, or gear cases.",
    rating: 4.8,
    stock: 150,
    isFeatured: false
  },
  {
    id: "merch-35",
    name: "Retrograde Heavy Loop Joggers",
    price: 55,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&q=80&w=600",
    description: "Thick premium French Terry jogger pants in cosmic black dye. Features side zippered pockets and subtle wave printing.",
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.7,
    stock: 15,
    isFeatured: false
  },
  {
    id: "merch-36",
    name: "Decade of Resonance Premium Box Set",
    price: 120,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600",
    description: "An ultimate limited collection: 3 gold splattered LPs, a hand-numbered art print, a vintage cassette tape, and custom metal keyring.",
    rating: 5.0,
    stock: 8,
    isFeatured: true
  },
  {
    id: "merch-37",
    name: "Velvet Horizon Custom Metal Keychain",
    price: 12,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600",
    description: "A custom hand-molded solid copper keychain shaped into our legendary solar sun pattern. Ages beautifully with standard oxidation.",
    rating: 4.5,
    stock: 80,
    isFeatured: false
  },
  {
    id: "merch-38",
    name: "Analog Sunset Corduroy Cap",
    price: 30,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1534215754734-18e55d13ce35?auto=format&fit=crop&q=80&w=600",
    description: "Unstructured 6-panel hat crafted from thick, durable wale corduroy in an elegant sunset gold shade.",
    sizes: ["One Size"],
    rating: 4.9,
    stock: 25,
    isFeatured: false
  },
  {
    id: "merch-39",
    name: "Modular Echoes Quad-CD Pack",
    price: 45,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?auto=format&fit=crop&q=80&w=600",
    description: "A stunning 4-disc pack housing all synthesized soundwave stems and studio-mastered backing tracks for guitar players.",
    rating: 4.8,
    stock: 15,
    isFeatured: false
  },
  {
    id: "merch-40",
    name: "Atmospheric Glass Guitar Slide Set",
    price: 25,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&q=80&w=600",
    description: "A pack of two borosilicate glass slides, custom tempered to deliver Elena's iconic, warm singing sustain and rich harmonics.",
    rating: 4.8,
    stock: 30,
    isFeatured: false
  },
  {
    id: "merch-41",
    name: "Resonance Crop Fleece Hoodie",
    price: 68,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=600",
    description: "Cozy cropped hoodie in washed teal, featuring a soft brushed inner lining and custom logo embroidery.",
    sizes: ["XS", "S", "M", "L", "XL"],
    rating: 4.6,
    stock: 18,
    isFeatured: false
  },
  {
    id: "merch-42",
    name: "Nocturnal Translucent Blue Cassette",
    price: 18,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1526478806334-5fa488c7eb40?auto=format&fit=crop&q=80&w=600",
    description: "A gorgeous, transparent aqua-blue cassette tape housing the exclusive nocturnal mixes of 'Elysian Fields'.",
    rating: 4.9,
    stock: 30,
    isFeatured: false
  },
  {
    id: "merch-43",
    name: "Ceramic Horizon Incense Burner",
    price: 28,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600",
    description: "Handmade ceramic holder featuring concentric wavy grooves representing soundwaves. Housed in a custom minimalist box.",
    rating: 4.7,
    stock: 40,
    isFeatured: false
  },
  {
    id: "merch-44",
    name: "Velvet Horizon Silk Bandana",
    price: 24,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600",
    description: "Premium silk bandana in a custom vintage paisley-meets-synthesizer-waveform layout. Can be worn in multiple styles.",
    sizes: ["One Size"],
    rating: 4.8,
    stock: 40,
    isFeatured: false
  },
  {
    id: "merch-45",
    name: "Celestial Anthems Live Vinyl",
    price: 40,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600",
    description: "A deluxe double LP containing our entire 18-track live performance from London Red Rocks, pressed on white marble-look vinyl.",
    rating: 5.0,
    stock: 25,
    isFeatured: true
  },
  {
    id: "merch-46",
    name: "Retrograde Headphone Hardcase",
    price: 22,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=600",
    description: "Hard-shell EVA carry case for monitor headphones. Featuring durable mesh internal organizers and custom solar patterns.",
    rating: 4.7,
    stock: 50,
    isFeatured: false
  },
  {
    id: "merch-47",
    name: "Elysian Fields Heavyweight Longsleeve",
    price: 42,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600",
    description: "Thick, boxy 240GSM cotton long sleeve tee featuring printed tour graphics running cleanly down both sleeves.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.9,
    stock: 20,
    isFeatured: false
  },
  {
    id: "merch-48",
    name: "Vaporwave Neon Pink Vinyl EP",
    price: 28,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1542208998-f6dbbb27a72f?auto=format&fit=crop&q=80&w=600",
    description: "A stunning collector's 10-inch EP pressed on vibrant translucent neon pink wax. Loaded with early nostalgic synthpop covers.",
    rating: 4.8,
    stock: 14,
    isFeatured: false
  },
  {
    id: "merch-49",
    name: "Midnight Sessions Felt Slipmat",
    price: 15,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600",
    description: "Classic black anti-static felt slipmat featuring a large minimalist copper foil representation of our nocturnal moon logo.",
    rating: 4.6,
    stock: 75,
    isFeatured: false
  },
  {
    id: "merch-50",
    name: "Fading Suns Mesh Trucker Hat",
    price: 26,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600",
    description: "Classic high-crown snapback trucker hat with a soft foam front, breathable mesh rear panel, and hand-printed graphic art.",
    sizes: ["One Size"],
    rating: 4.4,
    stock: 35,
    isFeatured: false
  },
  {
    id: "merch-51",
    name: "Resonance Instrumental Tape loops",
    price: 20,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1594122230689-45899d9e6f69?auto=format&fit=crop&q=80&w=600",
    description: "A genuine, physical 5-second modular synth audio tape loop for sound designers and analog cassette collectors.",
    rating: 4.8,
    stock: 12,
    isFeatured: false
  },
  {
    id: "merch-52",
    name: "Decade of Resonance Postcards",
    price: 12,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600",
    description: "Pack of 12 premium textured postcards containing exclusive studio diagrams, unreleased photos, and printed lyrics.",
    rating: 4.9,
    stock: 120,
    isFeatured: false
  },
  {
    id: "merch-53",
    name: "Studio Wave Organic Pocket Tee",
    price: 38,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1503341455253-b264128532c1?auto=format&fit=crop&q=80&w=600",
    description: "Classic off-white pocket tee made of 100% combed cotton, with a small wave graphic embroidery positioned on the pocket.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    rating: 4.8,
    stock: 28,
    isFeatured: false
  },
  {
    id: "merch-54",
    name: "Studio Echoes Collector CD Digi",
    price: 18,
    category: "music",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600",
    description: "Limited edition eco-friendly six-panel wallet containing bonus tracks, experimental mixes, and live guitar stems.",
    rating: 4.7,
    stock: 50,
    isFeatured: false
  },
  {
    id: "merch-55",
    name: "Velvet Horizon Braided Guitar Cable",
    price: 45,
    category: "accessories",
    imageUrl: "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?auto=format&fit=crop&q=80&w=600",
    description: "Elena's preferred 15-foot high-fidelity low-capacitance oxygen-free copper instrument cable with a stunning braided jacket.",
    rating: 4.9,
    stock: 24,
    isFeatured: true
  },
  {
    id: "merch-56",
    name: "Nocturnal Cozy Knit Scarf",
    price: 34,
    category: "apparel",
    imageUrl: "https://images.unsplash.com/photo-1520591799316-6b30425b29bb?auto=format&fit=crop&q=80&w=600",
    description: "An ultra-soft, 6-foot knit scarf featuring a reversible custom geometric pattern representing early synthesizer filters.",
    sizes: ["One Size"],
    rating: 4.8,
    stock: 16,
    isFeatured: false
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Behind the Studio Waves: Tracking 'Elysian Fields'",
    date: "June 14, 2026",
    category: "Studio Diary",
    summary: "Julian walks us through the grueling yet magical three-month recording sessions, detailing the modular synth stacks, live acoustic room reverbs, and finding our latest celestial direction.",
    content: "When we set out to write 'Elysian Fields', our target was clear: discard the safety net. Our previous records relied heavily on computer automation, but for this project, we wanted to capture human breath and direct room resonances.\n\nWe locked ourselves inside a converted barn in upstate New York for three cold months. We brought along Julian's massive Roland Juno, an array of vintage tube amplifiers, and a rare 1940s Vibraphone we leased from a jazz collector.\n\nChloe spent two continuous weeks adjusting distance microphones in the wooden attic to get the massive, unproduced drum tone you hear on 'Golden Hour'. Elena routed her Fender Stratocaster through experimental delays to evoke the feeling of cascading rain. We recorded everything directly to warm 2-inch tape, keeping first-take accidents. Here is the result: a solar-inspired record that breathes, cracks, and beams with organic hope. We can't wait to play these live for you next month!",
    imageUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80&w=600",
    likes: 342,
    comments: [
      { id: "com-1", author: "Sarah Jenkins", content: "The analog warmth in Golden Hour is absolutely incredible! You can genuinely hear the wood dust and vintage tapes in the room. Stellar work guys!", date: "June 15, 2026" },
      { id: "com-2", author: "Tom_SynthCollector", content: "Fascinating gear list. Was that a real Juno-106 or the reissue? The chorus on the track Resonance is unbelievably lush.", date: "June 16, 2026" }
    ],
    readTime: "5 min read",
    author: "Julian Vance"
  },
  {
    id: "blog-2",
    title: "How to Build a Stadium Delay Sound with Elena Rostova",
    date: "May 28, 2026",
    category: "Gear & Guide",
    summary: "Our lead guitarist gives a detailed, step-by-step masterclass on tone clipping, dual-delay sync configurations, and atmospheric pedal staging for giant rooms.",
    content: "If there's one question I get asked at every tour gig, it's: 'Elena, how do you make a single guitar sound like an entire cathedral?'\n\nThe secret isn't high volume—it is absolute spatial control. I rely on a technique called 'Dual-Staged Ping-Pong Stacking'. First, I split my signal. Side A goes to a dry, slightly driven tube head for string clarity. Side B is routed to a sequence of dual tape delays.\n\nDelay 1 is set to a crisp dotted-eighth note, feeding about 30% back into itself. Delay 2 is set to a much longer quarter-note with modulation, panning slightly wider in the stereo field. By feeding the dotted-eighth repeats directly into the modulated quarter-notes, the notes begin to diffuse into lush, sustained string layers. In our instrument booking workshops, I'll be sitting down with fans to dial this in on your personal boards. Check out the Lessons section to book a session!",
    imageUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=600",
    likes: 218,
    comments: [
      { id: "com-3", author: "GuitarGuy99", content: "Elena is a literal wizard. Stacking delay in series like that has totally evolved my ambient guitar writing. Thank you!", date: "May 29, 2026" }
    ],
    readTime: "4 min read",
    author: "Elena Rostova"
  },
  {
    id: "blog-3",
    title: "Back on the Road: Survival Guide for Touring Musicians",
    date: "April 19, 2026",
    category: "On the Road",
    summary: "Chloe and Marcus co-author a funny yet crucial guide on sleeping on tour buses, protecting your hearing in noisy clubs, and hunting for good espresso at 4:00 AM.",
    content: "We've spent half of our adult lives inside tight metal tour buses crossing continents. Along the way, we've developed some absolute ground rules for surviving the emotional and physical coaster of tour dates.\n\nFirst: Sleep is sacred. If you see a bandmate with their noise-canceling headphones on, respect it. It's their rare 10 square-inch sanctuary. \n\nSecond: High-fidelity custom earplugs. You cannot perform music if your hearing is damaged. Invest in quality molded plugs immediately.\n\nThird: The hunting of coffee. When you pull into Berlin or Chicago at 4:30 AM, nothing matters more than a good espresso. We keep a detailed shared pin map of artisanal roasteries near every venue. We'll be updating this blog live from our July tour stops so you can see where we're hanging out. Make sure to buy your tickets before they sell out!",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600",
    likes: 189,
    comments: [],
    readTime: "3 min read",
    author: "Chloe Mercer"
  }
];

export const FAQS: FAQ[] = [
  {
    id: "faq-1",
    question: "How do I receive my tickets when purchasing on your site?",
    answer: "Instantly upon checkout, we generate a high-fidelity digital ticket with a unique bar and booking code. You will also receive a backup confirmation email with a downloadable PDF. You can scan this ticket directly from your phone at the venue gate.",
    category: "tickets"
  },
  {
    id: "faq-2",
    question: "Do you ship merchandise internationally?",
    answer: "Yes! We ship all shirts, vinyls, keyrings, and accessories globally. Shipping rates are calculated at checkout based on your destination country. Most domestic orders arrive in 3-5 business days, while international shipping takes 7-14 business days.",
    category: "merchandise"
  },
  {
    id: "faq-3",
    question: "How do the instrument masterclasses and lesson bookings work?",
    answer: "Our instrument masterclasses are real-time, highly interactive 1-on-1 sessions taught directly by our band members. You can select your favorite instrument (Vocals/Synthesizers, Atmospheric Guitar, Bass/Beats, or Drums), select a tutor, and pick an available date and time slot. Sessions can take place online or back-stage during tour stops!",
    category: "lessons"
  },
  {
    id: "faq-4",
    question: "How can I unlock special tracks or download codes in the Discography?",
    answer: "We love rewarding our core listeners! Each album in our discography has a custom Trivia Quiz. Answer all three trivia and lore questions correctly for a specific album, and you will instantly unlock a 20% Store Discount Code and high-fidelity mock download options for that album's rare demo cuts!",
    category: "general"
  },
  {
    id: "faq-5",
    question: "What is your refund policy on ticket cancellations?",
    answer: "Tour tickets are fully refundable up to 7 days before the show. Simply open a ticket query with your booking ID. Within 7 days of the show, tickets can no longer be refunded but are fully transferable to another fan.",
    category: "tickets"
  },
  {
    id: "faq-6",
    question: "What vintage synthesizers and guitars do you play live?",
    answer: "Julian runs a Roland Juno-106, a Prophet-6, and a Moog Grandmother live on stage. Elena plays her vintage 1965 Fender Stratocaster and a custom jazzmaster through an array of tape delays. Rex plays a customized Fender Precision Bass and triggers drums via a Roland SPD-SX sampler.",
    category: "general"
  }
];

export const LESSON_TUTORS: LessonTutor[] = [
  {
    id: "tutor-1",
    name: "Julian Vance",
    role: "Vocals & Synth Masterclass",
    instrument: "Vocals & Synthesizers",
    bio: "Learn how to craft lush analog synth tracks, engineer complex polyphonic patches on vintage hardware, and build expressive vocal ranges with professional-grade breath and pitch controllers.",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
    pricePerHour: 75,
    availableDays: ["Monday", "Wednesday", "Friday"],
    availableSlots: ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM"]
  },
  {
    id: "tutor-2",
    name: "Elena Rostova",
    role: "Atmospheric Guitar Workshop",
    instrument: "Atmospheric Guitar",
    bio: "Unpack the secrets of ambient soundscapes, delay pedal stacking, rhythmic delay synchronization, high-gain tape saturation solos, and atmospheric reverb techniques.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
    pricePerHour: 70,
    availableDays: ["Tuesday", "Thursday", "Saturday"],
    availableSlots: ["11:00 AM", "3:00 PM", "5:00 PM", "8:00 PM"]
  },
  {
    id: "tutor-3",
    name: "Marcus \"Rex\" Thorn",
    role: "Bass Grooves & Drum Programming",
    instrument: "Bass & Beatmaking",
    bio: "Master driving, rhythmic basslines, synth-bass integrations, hardware drum machine programming, sub-bass tuning, and production methodologies for electronic-rock crossover records.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
    pricePerHour: 65,
    availableDays: ["Monday", "Thursday"],
    availableSlots: ["9:00 AM", "12:00 PM", "2:00 PM", "6:00 PM"]
  },
  {
    id: "tutor-4",
    name: "Chloe Mercer",
    role: "Creative Drums & Hybrid Percussion",
    instrument: "Drums & Rhythms",
    bio: "Develop raw tempo-holding, syncopated rhythms, integrating digital drum triggers with organic acoustic kits, speed drills, and polyrhythmic design for massive rock tracks.",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600",
    pricePerHour: 70,
    availableDays: ["Wednesday", "Saturday", "Sunday"],
    availableSlots: ["10:00 AM", "1:00 PM", "3:00 PM", "6:00 PM"]
  },
  {
    id: "tutor-5",
    name: "Sienna Brooks",
    role: "Songwriting, Lyre & Arrangement Masterclass",
    instrument: "Songwriting & Arrangement",
    bio: "Unlock methods behind writing highly emotional lyrics, structuring anthemic choruses, managing harmonic modes, and arranging multi-instrument track layers for polished studio production.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600",
    pricePerHour: 68,
    availableDays: ["Tuesday", "Friday", "Sunday"],
    availableSlots: ["1:00 PM", "4:00 PM", "7:00 PM"]
  }
];
