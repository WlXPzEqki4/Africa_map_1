import { useState, useEffect, useCallback, useRef } from 'react';
import Globe from 'react-globe.gl';
import { feature } from 'topojson-client';
import { GlobeIcon, MapPin, Globe as GlobeIconSolid, AlertTriangle, Briefcase, FileText, Building, Shield } from 'lucide-react';
import facilitiesData from './data/facilities.json';
import sectorsData from './data/sectors.json';
import sectorsDetailsData from './data/sectorsDetails.json';

interface CountryInfo {
  name: string;
  capital: string;
  population: string;
  area: string;
  description: string;
  landmarks: string[];
  cities: Array<{
    name: string;
    lat: number;
    lng: number;
    population: string;
  }>;
  keyLocations?: Array<{
    name: string;
    lat: number;
    lng: number;
    description: string;
  }>;
}

interface FlightPath {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label: string;
  direction: 'in' | 'out';
}

interface CountryFeature {
  properties: {
    name: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Facility {
  facility_id: number;
  facility_name: string;
  facility_type: string;
  country_name: string;
  operator_name: string;
  operator_type: string;
  status: string;
  color: string;
  latitude: number;
  longitude: number;
}

interface SectorDetails {
  sector: string;
  description: string;
  investment_details: string;
  major_projects: string[];
  security_risks: string[];
  mitigation_capabilities: string[];
  bilateral_agreements: string[];
  entities?: Array<{
    name: string;
    logo: string;
    description: string;
  }>;
  countries: Array<{
    name: string;
    investment_type: string;
    security_risks: string[];
    mitigation_capabilities: string[];
    projects?: string[];
  }>;
}

const globeTextures = [
  {
    id: 'labeled-natural',
    name: 'Natural with Labels',
    url: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-day.jpg'
  },
  {
    id: 'labeled-dark',
    name: 'Dark with Labels',
    url: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night-labeled.jpg'
  },
  {
    id: 'blue-marble',
    name: 'Blue Marble',
    url: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    url: 'https://unpkg.com/three-globe/example/img/earth-dark.jpg'
  },
  {
    id: 'natural',
    name: 'Natural Earth',
    url: 'https://unpkg.com/three-globe/example/img/earth-topology.png'
  },
  {
    id: 'night',
    name: 'Night Lights',
    url: 'https://unpkg.com/three-globe/example/img/earth-night.jpg'
  },
  {
    id: 'water',
    name: 'Water Color',
    url: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-water.png'
  },
  {
    id: 'topo',
    name: 'Topographic',
    url: 'https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topo.png'
  }
];

const countryInfo: { [key: string]: CountryInfo } = {
  'Algeria': {
    name: 'Algeria',
    capital: 'Algiers',
    population: '44.6 million',
    area: '2.38 million km²',
    description: 'Algeria is the largest country in Africa, known for its Mediterranean coastline, Saharan desert landscapes, and rich cultural heritage blending Arab, Berber, and French influences.',
    landmarks: ['Casbah of Algiers', 'Timgad Roman Ruins', 'Tassili n\'Ajjer', 'Notre Dame d\'Afrique'],
    cities: [
      { name: 'Algiers', lat: 36.7372, lng: 3.0863, population: '3.5 million' },
      { name: 'Oran', lat: 35.6969, lng: -0.6331, population: '1.5 million' },
      { name: 'Constantine', lat: 36.3650, lng: 6.6147, population: '450,000' }
    ]
  },
  'Angola': {
    name: 'Angola',
    capital: 'Luanda',
    population: '32.9 million',
    area: '1.247 million km²',
    description: 'Angola is a country rich in natural resources with diverse landscapes from tropical beaches to labyrinthine systems of rivers and sub-Saharan desert.',
    landmarks: ['Kissama National Park', 'Tundavala Gap', 'Kalandula Falls', 'Fortress of São Miguel'],
    cities: [
      { name: 'Luanda', lat: -8.8389, lng: 13.2894, population: '8.3 million' },
      { name: 'Huambo', lat: -12.7761, lng: 15.7392, population: '1.2 million' },
      { name: 'Lobito', lat: -12.3647, lng: 13.5456, population: '800,000' }
    ]
  },
  'Benin': {
    name: 'Benin',
    capital: 'Porto-Novo',
    population: '12.1 million',
    area: '114,763 km²',
    description: 'Benin is known for its rich history as the center of the ancient Dahomey kingdom and its vibrant culture, including voodoo traditions and beautiful coastal areas.',
    landmarks: ['Royal Palaces of Abomey', 'Pendjari National Park', 'Ganvie Lake Village', 'Door of No Return'],
    cities: [
      { name: 'Porto-Novo', lat: 6.4969, lng: 2.6283, population: '300,000' },
      { name: 'Cotonou', lat: 6.3703, lng: 2.3912, population: '780,000' },
      { name: 'Parakou', lat: 9.3370, lng: 2.6362, population: '255,000' }
    ]
  },
  'Botswana': {
    name: 'Botswana',
    capital: 'Gaborone',
    population: '2.3 million',
    area: '581,730 km²',
    description: 'Botswana is celebrated for its vast Kalahari Desert, abundant wildlife, and the Okavango Delta, one of Africa\'s most spectacular natural wonders.',
    landmarks: ['Okavango Delta', 'Chobe National Park', 'Tsodilo Hills', 'Kgalagadi Transfrontier Park'],
    cities: [
      { name: 'Gaborone', lat: -24.6282, lng: 25.9231, population: '231,592' },
      { name: 'Francistown', lat: -21.1708, lng: 27.5087, population: '98,961' },
      { name: 'Molepolole', lat: -24.4067, lng: 25.4950, population: '67,598' }
    ]
  },
  'Burkina Faso': {
    name: 'Burkina Faso',
    capital: 'Ouagadougou',
    population: '20.9 million',
    area: '274,200 km²',
    description: 'Burkina Faso is known for its vibrant cultural festivals, traditional crafts, and music scene, as well as its diverse landscape ranging from savanna to desert.',
    landmarks: ['Sindou Peaks', 'Karfiguela Falls', 'Nazinga Ranch', 'Grand Mosque of Bobo-Dioulasso'],
    cities: [
      { name: 'Ouagadougou', lat: 12.3714, lng: -1.5197, population: '2.2 million' },
      { name: 'Bobo-Dioulasso', lat: 11.1750, lng: -4.2986, population: '537,728' },
      { name: 'Koudougou', lat: 12.2500, lng: -2.3667, population: '132,430' }
    ]
  },
  'Burundi': {
    name: 'Burundi',
    capital: 'Gitega',
    population: '11.9 million',
    area: '27,830 km²',
    description: 'Burundi is a small country known for its beautiful Lake Tanganyika shoreline, mountainous landscape, and traditional drum performances.',
    landmarks: ['Rusizi National Park', 'Lake Tanganyika', 'Kibira National Park', 'Livingstone-Stanley Monument'],
    cities: [
      { name: 'Gitega', lat: -3.4271, lng: 29.9246, population: '135,000' },
      { name: 'Bujumbura', lat: -3.3614, lng: 29.3599, population: '497,166' },
      { name: 'Muyinga', lat: -2.8451, lng: 30.3414, population: '71,076' }
    ]
  },
  'Cameroon': {
    name: 'Cameroon',
    capital: 'Yaoundé',
    population: '26.5 million',
    area: '475,442 km²',
    description: 'Cameroon is known as "Africa in miniature" for its geological and cultural diversity, featuring beaches, deserts, mountains, rainforests, and savannas.',
    landmarks: ['Mount Cameroon', 'Waza National Park', 'Kribi Beach', 'Limbe Wildlife Centre'],
    cities: [
      { name: 'Yaoundé', lat: 3.8480, lng: 11.5021, population: '4 million' },
      { name: 'Douala', lat: 4.0511, lng: 9.7679, population: '3.8 million' },
      { name: 'Bamenda', lat: 5.9631, lng: 10.1591, population: '2 million' }
    ]
  },
  'Central African Republic': {
    name: 'Central African Republic',
    capital: 'Bangui',
    population: '4.8 million',
    area: '622,984 km²',
    description: 'The Central African Republic is home to vast tropical rainforests, diverse wildlife, and the Dzanga-Sangha Special Reserve, known for its forest elephants.',
    landmarks: ['Dzanga-Sangha Reserve', 'Boali Falls', 'Notre-Dame Cathedral of Bangui', 'Manovo-Gounda St. Floris National Park'],
    cities: [
      { name: 'Bangui', lat: 4.3947, lng: 18.5582, population: '889,231' },
      { name: 'Bimbo', lat: 4.2590, lng: 18.4169, population: '267,859' },
      { name: 'Berbérati', lat: 4.2614, lng: 15.7789, population: '76,918' }
    ]
  },
  'Chad': {
    name: 'Chad',
    capital: 'N\'Djamena',
    population: '16.4 million',
    area: '1.284 million km²',
    description: 'Chad is a country of striking natural beauty, from the Sahara Desert in the north to the fertile Sahel in the south, featuring unique rock formations and diverse wildlife.',
    landmarks: ['Ennedi Plateau', 'Lakes of Ounianga', 'Zakouma National Park', 'Tibesti Mountains'],
    cities: [
      { name: 'N\'Djamena', lat: 12.1348, lng: 15.0557, population: '1.3 million' },
      { name: 'Moundou', lat: 8.5667, lng: 16.0833, population: '142,462' },
      { name: 'Abéché', lat: 13.8292, lng: 20.8324, population: '76,492' }
    ]
  },
  'Congo': {
    name: 'Congo',
    capital: 'Brazzaville',
    population: '5.5 million',
    area: '342,000 km²',
    description: 'The Republic of the Congo features extensive rainforests, abundant wildlife, and the mighty Congo River, with a rich cultural heritage and vibrant arts scene.',
    landmarks: ['Nouabalé-Ndoki National Park', 'Basilique Sainte-Anne', 'Loufoulakari Falls', 'Conkouati-Douli National Park'],
    cities: [
      { name: 'Brazzaville', lat: -4.2634, lng: 15.2429, population: '2.2 million' },
      { name: 'Pointe-Noire', lat: -4.7889, lng: 11.8653, population: '969,000' },
      { name: 'Dolisie', lat: -4.1967, lng: 12.6667, population: '83,798' }
    ]
  },
  'Democratic Republic of the Congo': {
    name: 'Democratic Republic of the Congo',
    capital: 'Kinshasa',
    population: '89.56 million',
    area: '2.345 million km²',
    description: 'The Democratic Republic of the Congo is the second-largest country in Africa, known for its vast rainforests, the Congo River Basin, and incredible biodiversity.',
    landmarks: ['Virunga National Park', 'Salonga National Park', 'Kahuzi-Biega National Park', 'Garamba National Park'],
    cities: [
      { name: 'Kinshasa', lat: -4.4419, lng: 15.2663, population: '14.5 million' },
      { name: 'Lubumbashi', lat: -11.6876, lng: 27.5026, population: '2.2 million' },
      { name: 'Mbuji-Mayi', lat: -6.1361, lng: 23.5894, population: '2.1 million' }
    ]
  },
  'Djibouti': {
    name: 'Djibouti',
    capital: 'Djibouti City',
    population: '988,000',
    area: '23,200 km²',
    description: 'Djibouti features unique geological formations, salt lakes, and the meeting point of the Red Sea and the Gulf of Aden, with a strategic location in the Horn of Africa.',
    landmarks: ['Lake Assal', 'Day Forest National Park', 'Moucha Island', 'Lake Abbé'],
    cities: [
      { name: 'Djibouti City', lat: 11.5886, lng: 43.1450, population: '624,000' },
      { name: 'Ali Sabieh', lat: 11.1558, lng: 42.7125, population: '40,074' },
      { name: 'Tadjoura', lat: 11.7853, lng: 42.8844, population: '22,193' }
    ]
  },
  'Egypt': {
    name: 'Egypt',
    capital: 'Cairo',
    population: '104 million',
    area: '1.01 million km²',
    description: 'Egypt is home to one of the world\'s oldest civilizations, featuring iconic pyramids, ancient temples, and the life-giving Nile River.',
    landmarks: ['Great Pyramids of Giza', 'Valley of the Kings', 'Abu Simbel Temples', 'Egyptian Museum'],
    cities: [
      { name: 'Cairo', lat: 30.0444, lng: 31.2357, population: '20.9 million' },
      { name: 'Alexandria', lat: 31.2001, lng: 29.9187, population: '5.2 million' },
      { name: 'Giza', lat: 30.0131, lng: 31.2089, population: '3.8 million' }
    ]
  },
  'Equatorial Guinea': {
    name: 'Equatorial Guinea',
    capital: 'Malabo',
    population: '1.4 million',
    area: '28,051 km²',
    description: 'Equatorial Guinea consists of mainland territory and islands, featuring tropical forests, pristine beaches, and colonial architecture.',
    landmarks: ['Monte Alén National Park', 'Malabo Cathedral', 'Arena Blanca Beach', 'Pico Basilé'],
    cities: [
      { name: 'Malabo', lat: 3.7523, lng: 8.7742, population: '297,000' },
      { name: 'Bata', lat: 1.8639, lng: 9.7697, population: '250,770' },
      { name: 'Ebebiyín', lat: 2.1511, lng: 11.3353, population: '36,565' }
    ]
  },
  'Eritrea': {
    name: 'Eritrea',
    capital: 'Asmara',
    population: '3.5 million',
    area: '117,600 km²',
    description: 'Eritrea features a long Red Sea coastline, historic ports, and the modernist architecture of Asmara, a UNESCO World Heritage site.',
    landmarks: ['Dahlak Archipelago', 'Imperial Palace', 'Tank Graveyard', 'Martyrs National Park'],
    cities: [
      { name: 'Asmara', lat: 15.3229, lng: 38.9251, population: '963,000' },
      { name: 'Keren', lat: 15.7778, lng: 38.4511, population: '146,483' },
      { name: 'Massawa', lat: 15.6079, lng: 39.4745, population: '52,000' }
    ]
  },
  'Ethiopia': {
    name: 'Ethiopia',
    capital: 'Addis Ababa',
    population: '117.9 million',
    area: '1.104 million km²',
    description: 'Ethiopia is known for its ancient Christian heritage, unique cultural traditions, and dramatic landscapes including the Simien Mountains.',
    landmarks: ['Rock-Hewn Churches of Lalibela', 'Simien Mountains', 'Blue Nile Falls', 'Danakil Depression'],
    cities: [
      { name: 'Addis Ababa', lat: 9.0320, lng: 38.7492, population: '3.4 million' },
      { name: 'Dire Dawa', lat: 9.5931, lng: 41.8661, population: '440,000' },
      { name: 'Mek\'ele', lat: 13.4967, lng: 39.4767, population: '310,436' }
    ]
  },
  'Eswatini': {
    name: 'Eswatini',
    capital: 'Mbabane (administrative), Lobamba (royal and legislative)',
    population: '1.2 million',
    area: '17,364 km²',
    description: 'Eswatini (formerly known as Swaziland) is one of the last absolute monarchies in the world. It\'s known for its wilderness reserves, traditional festivals, and rich cultural heritage that blends ancient customs with modern life.',
    landmarks: ['Mlilwane Wildlife Sanctuary', 'Mantenga Cultural Village', 'Sibebe Rock', 'Hlane Royal National Park'],
    cities: [
      { name: 'Mbabane', lat: -26.3054, lng: 31.1367, population: '95,000' },
      { name: 'Manzini', lat: -26.4956, lng: 31.3797, population: '110,000' },
      { name: 'Lobamba', lat: -26.4667, lng: 31.2000, population: '6,000' }
    ]
  },
  'Gabon': {
    name: 'Gabon',
    capital: 'Libreville',
    population: '2.3 million',
    area: '267,667 km²',
    description: 'Gabon is known for its extensive rainforests, diverse wildlife including gorillas and chimpanzees, and pristine coastal areas.',
    landmarks: ['Lopé National Park', 'L\'Église St-Michel', 'Pointe Denis Beach', 'Ivindo National Park'],
    cities: [
      { name: 'Libreville', lat: 0.4162, lng: 9.4673, population: '703,904' },
      { name: 'Port-Gentil', lat: -0.7193, lng: 8.7815, population: '136,462' },
      { name: 'Franceville', lat: -1.6333, lng: 13.5833, population: '110,568' }
    ]
  },
  'Gambia': {
    name: 'Gambia',
    capital: 'Banjul',
    population: '2.4 million',
    area: '11,295 km²',
    description: 'The Gambia is the smallest country in mainland Africa, centered around the Gambia River, with rich birdlife and historic slave trade sites.',
    landmarks: ['James Island', 'Abuko Nature Reserve', 'Kachikally Crocodile Pool', 'Arch 22'],
    cities: [
      { name: 'Banjul', lat: 13.4549, lng: -16.5790, population: '31,301' },
      { name: 'Serekunda', lat: 13.4383, lng: -16.6778, population: '340,000' },
      { name: 'Brikama', lat: 13.2714, lng: -16.6494, population: '77,700' }
    ]
  },
  'Ghana': {
    name: 'Ghana',
    capital: 'Accra',
    population: '31.7 million',
    area: '238,535 km²',
    description: 'Ghana is known for its diverse landscape, from coastal savannas to tropical jungles, historic slave castles, and vibrant cultural traditions.',
    landmarks: ['Cape Coast Castle', 'Kakum National Park', 'Lake Volta', 'Mole National Park'],
    cities: [
      { name: 'Accra', lat: 5.6037, lng: -0.1870, population: '2.5 million' },
      { name: 'Kumasi', lat: 6.6885, lng: -1.6244, population: '3.3 million' },
      { name: 'Tamale', lat: 9.4075, lng: -0.8533, population: '950,124' }
    ]
  },
  'Guinea': {
    name: 'Guinea',
    capital: 'Conakry',
    population: '13.1 million',
    area: '245,857 km²',
    description: 'Guinea is known as the "water tower of Africa" due to its numerous rivers and waterfalls, featuring diverse landscapes from coastal regions to mountains.',
    landmarks: ['Mount Nimba Strict Nature Reserve', 'National Park of Upper Niger', 'Îles de Los', 'Fouta Djallon'],
    cities: [
      { name: 'Conakry', lat: 9.6412, lng: -13.5784, population: '1.7 million' },
      { name: 'Nzérékoré', lat: 7.7500, lng: -8.8167, population: '300,000' },
      { name: 'Kankan', lat: 10.3854, lng: -9.3057, population: '200,000' }
    ]
  },
  'Guinea-Bissau': {
    name: 'Guinea-Bissau',
    capital: 'Bissau',
    population: '1.9 million',
    area: '36,125 km²',
    description: 'Guinea-Bissau includes the mainland and the Bijagos Archipelago, known for its diverse wildlife, colonial Portuguese architecture, and traditional villages.',
    landmarks: ['Bijagos Archipelago', 'Varela Beach', 'Fortaleza d\'Amura', 'Orango National Park'],
    cities: [
      { name: 'Bissau', lat: 11.8636, lng: -15.5977, population: '492,000' },
      { name: 'Bafatá', lat: 12.1667, lng: -14.6667, population: '22,521' },
      { name: 'Gabú', lat: 12.2833, lng: -14.2333, population: '14,430' }
    ]
  },
  'Ivory Coast': {
    name: 'Ivory Coast',
    capital: 'Yamoussoukro',
    population: '26.4 million',
    area: '322,463 km²',
    description: 'Ivory Coast is known for its beach resorts, rainforests, and the French-colonial legacy, featuring the world\'s largest church building.',
    landmarks: ['Basilica of Our Lady of Peace', 'Taï National Park', 'Mount Nimba', 'Comoe National Park'],
    cities: [
      { name: 'Yamoussoukro', lat: 6.8276, lng: -5.2893, population: '355,573' },
      { name: 'Abidjan', lat: 5.3600, lng: -4.0083, population: '4.7 million' },
      { name: 'Bouaké', lat: 7.6906, lng: -5.0304, population: '536,189' }
    ]
  },
  'Kenya': {
    name: 'Kenya',
    capital: 'Nairobi',
    population: '54 million',
    area: '580,367 km²',
    description: 'Kenya is renowned for its savanna wildlife, the Great Rift Valley, diverse indigenous cultures, and beautiful Indian Ocean beaches.',
    landmarks: ['Masai Mara', 'Mount Kenya', 'Lake Nakuru', 'Lamu Old Town'],
    cities: [
      { name: 'Nairobi', lat: -1.2921, lng: 36.8219, population: '4.4 million' },
      { name: 'Mombasa', lat: -4.0435, lng: 39.6682, population: '1.2 million' },
      { name: 'Kisumu', lat: -0.1022, lng: 34.7617, population: '610,082' }
    ]
  },
  'Lesotho': {
    name: 'Lesotho',
    capital: 'Maseru',
    population: '2.1 million',
    area: '30,355 km²',
    description: 'Lesotho is known as the "Kingdom in the Sky" due to its high altitude, featuring stunning mountain scenery and traditional Basotho culture.',
    landmarks: ['Thabana Ntlenyana', 'Maletsunyane Falls', 'Sehlabathebe National Park', 'Thaba Bosiu'],
    cities: [
      { name: 'Maseru', lat: -29.3167, lng: 27.4833, population: '330,760' },
      { name: 'Teyateyaneng', lat: -29.1472, lng: 27.7489, population: '75,115' },
      { name: 'Mafeteng', lat: -29.8167, lng: 27.2500, population: '57,059' }
    ]
  },
  'Liberia': {
    name: 'Liberia',
    capital: 'Monrovia',
    population: '5.1 million',
    area: '111,369 km²',
    description: 'Liberia features pristine rainforests, scenic beaches, and historic sites related to its unique history as Africa\'s first independent republic.',
    landmarks: ['Sapo National Park', 'Providence Island', 'Mount Nimba', 'Blue Lake'],
    cities: [
      { name: 'Monrovia', lat: 6.3004, lng: -10.7969, population: '1.2 million' },
      { name: 'Gbarnga', lat: 7.0104, lng: -9.4847, population: '45,835' },
      { name: 'Buchanan', lat: 5.8762, lng: -10.0467, population: '34,270' }
    ]
  },
  'Libya': {
    name: 'Libya',
    capital: 'Tripoli',
    population: '6.9 million',
    area: '1.76 million km²',
    description: 'Libya features ancient Roman and Greek ruins, Sahara Desert landscapes, and Mediterranean coastline, with a rich history of ancient civilizations.',
    landmarks: ['Leptis Magna', 'Cyrene', 'Ghadames', 'Akakus Mountains'],
    cities: [
      { name: 'Tripoli', lat: 32.8872, lng: 13.1913, population: '1.1 million' },
      { name: 'Benghazi', lat: 32.1167, lng: 20.0667, population: '631,555' },
      { name: 'Misrata', lat: 32.3754, lng: 15.0925, population: '281,000' }
    ],
    keyLocations: [
      {
        name: 'Leptis Magna',
        lat: 32.6383,
        lng: 14.2899,
        description: 'Ancient Roman city ruins, one of the most spectacular and unspoiled Roman ruins in the Mediterranean.'
      },
      {
        name: 'Cyrene',
        lat: 32.8281,
        lng: 21.8564,
        description: 'Ancient Greek colony and subsequent Roman city, featuring impressive ruins and archaeological sites.'
      },
      {
        name: 'Ghadames',
        lat: 30.1333,
        lng: 9.5000,
        description: 'Ancient desert oasis town known as "the pearl of the desert", a UNESCO World Heritage site.'
      },
      {
        name: 'Akakus Mountains',
        lat: 24.9500,
        lng: 10.7500,
        description: 'Mountain range featuring prehistoric rock art and dramatic desert landscapes.'
      },
      {
        name: 'Sabratha',
        lat: 32.7933,
        lng: 12.4885,
        description: 'Ancient Roman city with a well-preserved theater and beautiful Mediterranean coastline.'
      }
    ]
  },
  'Madagascar': {
    name: 'Madagascar',
    capital: 'Antananarivo',
    population: '27.7 million',
    area: '587,041 km²',
    description: 'Madagascar is known for its unique wildlife, including lemurs and chameleons, diverse landscapes, and distinctive cultural heritage.',
    landmarks: ['Avenue of the Baobabs', 'Tsingy de Bemaraha', 'Ranomafana National Park', 'Nosy Be'],
    cities: [
      { name: 'Antananarivo', lat: -18.8792, lng: 47.5079, population: '3.2 million' },
      { name: 'Toamasina', lat: -18.1667, lng: 49.3833, population: '274,667' },
      { name: 'Antsirabe', lat: -19.8667, lng: 47.0333, population: '238,478' }
    ]
  },
  'Malawi': {
    name: 'Malawi',
    capital: 'Lilongwe',
    population: '19.1 million',
    area: '118,484 km²',
    description: 'Malawi is known as the "Warm Heart of Africa," featuring Lake Malawi, diverse wildlife, and friendly people with rich cultural traditions.',
    landmarks: ['Lake Malawi', 'Mount Mulanje', 'Liwonde National Park', 'Nyika National Park'],
    cities: [
      { name: 'Lilongwe', lat: -13.9669, lng: 33.7873, population: '989,318' },
      { name: 'Blantyre', lat: -15.7861, lng: 35.0058, population: '800,264' },
      { name: 'Mzuzu', lat: -11.4656, lng: 34.0207, population: '221,272' }
    ]
  },
  'Mali': {
    name: 'Mali',
    capital: 'Bamako',
    population: '20.9 million',
    area: '1.24 million km²',
    description: 'Mali features ancient cities, including Timbuktu, diverse landscapes from the Sahara Desert to the Niger River, and rich musical heritage.',
    landmarks: ['Great Mosque of Djenné', 'Timbuktu', 'Bandiagara Escarpment', 'Niger River'],
    cities: [
      { name: 'Bamako', lat: 12.6392, lng: -8.0029, population: '2.7 million' },
      { name: 'Sikasso', lat: 11.3167, lng: -5.6667, population: '225,753' },
      { name: 'Mopti', lat: 14.4843, lng: -4.1838, population: '114,296' }
    ]
  },
  'Mauritania': {
    name: 'Mauritania',
    capital: 'Nouakchott',
    population: '4.6 million',
    area: '1.03 million km²',
    description: 'Mauritania is largely covered by the Sahara Desert, featuring ancient caravan cities, coastal fishing communities, and unique cultural traditions.',
    landmarks: ['Chinguetti Mosque', 'Banc d\'Arguin National Park', 'Ancient Ksour of Ouadane', 'Port de Pêche'],
    cities: [
      { name: 'Nouakchott', lat: 18.0735, lng: -15.9582, population: '1.2 million' },
      { name: 'Nouadhibou', lat: 20.9319, lng: -17.0347, population: '118,167' },
      { name: 'Kiffa', lat: 16.6167, lng: -11.4000, population: '40,281' }
    ]
  },
  'Morocco': {
    name: 'Morocco',
    capital: 'Rabat',
    population: '37 million',
    area: '446,550 km²',
    description: 'Morocco features ancient medinas, Saharan dunes, Atlas Mountains, and rich cultural heritage blending Arab, Berber, and European influences.',
    landmarks: ['Hassan II Mosque', 'Djemaa el-Fna', 'Chefchaouen', 'Volubilis'],
    cities: [
      { name: 'Rabat', lat: 34.0209, lng: -6.8416, population: '577,827' },
      { name: 'Casablanca', lat: 33.5731, lng: -7.5898, population: '3.4 million' },
      { name: 'Fez', lat: 34.0333, lng: -5.0000, population: '1.1 million' }
    ]
  },
  'Mozambique': {
    name: 'Mozambique',
    capital: 'Maputo',
    population: '31.3 million',
    area: '801,590 km²',
    description: 'Mozambique features long Indian Ocean coastline, marine parks, coral reefs, and historic Portuguese colonial architecture.',
    landmarks: ['Ilha de Moçambique', 'Gorongosa National Park', 'Bazaruto Archipelago', 'Cathedral of Our Lady of the Immaculate Conception'],
    cities: [
      { name: 'Maputo', lat: -25.9692, lng: 32.5732, population: '1.1 million' },
      { name: 'Matola', lat: -25.9622, lng: 32.4589, population: '675,422' },
      { name: 'Beira', lat: -19.8436, lng: 34.8389, population: '533,825' }
    ]
  },
  'Namibia': {
    name: 'Namibia',
    capital: 'Windhoek',
    population: '2.5 million',
    area: '825,615 km²',
    description: 'Namibia is known for its dramatic landscapes including the Namib Desert, Fish River Canyon, and diverse wildlife in Etosha National Park.',
    landmarks: ['Sossusvlei', 'Etosha National Park', 'Fish River Canyon', 'Skeleton Coast'],
    cities: [
      { name: 'Windhoek', lat: -22.5609, lng: 17.0658, population: '325,858' },
      { name: 'Walvis Bay', lat: -22.9575, lng: 14.5053, population: '62,096' },
      { name: 'Swakopmund', lat: -22.6784, lng: 14.5258, population: '44,725' }
    ]
  },
  'Niger': {
    name: 'Niger',
    capital: 'Niamey',
    population: '24.2 million',
    area: '1.267 million km²',
    description: 'Niger features vast desert landscapes, ancient caravan cities, and unique cultural heritage including the Tuareg and Wodaabe peoples.',
    landmarks: ['Agadez Grand Mosque', 'W National Park', 'Air Mountains', 'Djado Plateau'],
    cities: [
      { name: 'Niamey', lat: 13.5117, lng: 2.1251, population: '1.2 million' },
      { name: 'Zinder', lat: 13.8072, lng: 8.9881, population: '235,605' },
      { name: 'Maradi', lat: 13.5000, lng: 7.1000, population: '267,249' }
    ]
  },
  'Nigeria': {
    name: 'Nigeria',
    capital: 'Abuja',
    population: '206 million',
    area: '923,768 km²',
    description: 'Nigeria is Africa\'s most populous country, featuring diverse cultures, landscapes from rainforests to savannas, and vibrant arts scene.',
    landmarks: ['Zuma Rock', 'Yankari National Park', 'Olumo Rock', 'Nike Art Gallery'],
    cities: [
      { name: 'Abuja', lat: 9.0765, lng: 7.3986, population: '3.2 million' },
      { name: 'Lagos', lat: 6.5244, lng: 3.3792, population: '14.8 million' },
      { name: 'Kano', lat: 12.0000, lng: 8.5167, population: '3.8 million' }
    ]
  },
  'Rwanda': {
    name: 'Rwanda',
    capital: 'Kigali',
    population: '13.2 million',
    area: '26,338 km²',
    description: 'Rwanda is known as the "Land of a Thousand Hills," featuring mountain gorillas, beautiful lakes, and a remarkable post-conflict transformation.',
    landmarks: ['Volcanoes National Park', 'Lake Kivu', 'Nyungwe National Park', 'Genocide Memorial'],
    cities: [
      { name: 'Kigali', lat: -1.9441, lng: 30.0619, population: '1.1 million' },
      { name: 'Butare', lat: -2.5962, lng: 29.7397, population: '89,600' },
      { name: 'Gisenyi', lat: -1.7017, lng: 29.2569, population: '83,623' }
    ]
  },
  'Senegal': {
    name: 'Senegal',
    capital: 'Dakar',
    population: '16.7 million',
    area: '196,722 km²',
    description: 'Senegal is known for its vibrant culture, diverse ecosystems including the Sahel and Atlantic coast, and as a gateway to West Africa.',
    landmarks: ['Gorée Island', 'Pink Lake', 'Djoudj National Bird Sanctuary', 'African Renaissance Monument'],
    cities: [
      { name: 'Dakar', lat: 14.7167, lng: -17.4677, population: '2.5 million' },
      { name: 'Touba', lat: 14.8667, lng: -15.8833, population: '1 million' },
      { name: 'Thiès', lat: 14.7833, lng: -16.9167, population: '320,000' }
    ]
  },
  'Sierra Leone': {
    name: 'Sierra Leone',
    capital: 'Freetown',
    population: '7.9 million',
    area: '71,740 km²',
    description: 'Sierra Leone features beautiful beaches, rainforests, and diamond-rich regions, with a history of resilience and recovery.',
    landmarks: ['Tacugama Chimpanzee Sanctuary', 'Bunce Island', 'Outamba-Kilimi National Park', 'Cotton Tree'],
    cities: [
      { name: 'Freetown', lat: 8.4900, lng: -13.2344, population: '1.1 million' },
      { name: 'Bo', lat: 7.9647, lng: -11.7383, population: '174,354' },
      { name: 'Kenema', lat: 7.8833, lng: -11.1833, population: '143,137' }
    ]
  },
  'Somalia': {
    name: 'Somalia',
    capital: 'Mogadishu',
    population: '15.9 million',
    area: '637,657 km²',
    description: 'Somalia features the longest coastline in mainland Africa, historic coastal towns, and traditional nomadic culture.',
    landmarks: ['Laas Geel Cave Paintings', 'Mogadishu Cathedral', 'Shanghai Old City', 'Kismayo National Park'],
    cities: [
      { name: 'Mogadishu', lat: 2.0469, lng: 45.3182, population: '2.2 million' },
      { name: 'Hargeisa', lat: 9.5582, lng: 44.0410, population: '760,000' },
      { name: 'Kismayo', lat: -0.3582, lng: 42.5454, population: '180,000' }
    ]
  },
  'Somaliland': {
    name: 'Somaliland',
    capital: 'Hargeisa',
    population: '5.7 million',
    area: '176,120 km²',
    description: 'Somaliland is a self-declared state in the Horn of Africa, internationally recognized as part of Somalia but functioning as a de facto independent country since 1991. It has its own government, currency, and military.',
    landmarks: ['Laas Geel Cave Paintings', 'Sheikh Mountains', 'Berbera Beach', 'Daallo Mountain'],
    cities: [
      { name: 'Hargeisa', lat: 9.5582, lng: 44.0410, population: '1.2 million' },
      { name: 'Berbera', lat: 10.4325, lng: 45.0167, population: '240,000' },
      { name: 'Burao', lat: 9.5236, lng: 45.5336, population: '420,000' }
    ]
  },
  'South Africa': {
    name: 'South Africa',
    capital: 'Pretoria',
    population: '60.1 million',
    area: '1.22 million km²',
    description: 'South Africa features diverse landscapes from mountains to savannas, rich wildlife, and vibrant cities with a complex historical heritage.',
    landmarks: ['Table Mountain', 'Kruger National Park', 'Robben Island', 'Cape of Good Hope'],
    cities: [
      { name: 'Pretoria', lat: -25.7479, lng: 28.2293, population: '741,651' },
      { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, population: '5.7 million' },
      { name: 'Cape Town', lat: -33.9249, lng: 18.4241, population: '4.6 million' }
    ]
  },
  'South Sudan': {
    name: 'South Sudan',
    capital: 'Juba',
    population: '11.2 million',
    area: '644,329 km²',
    description: 'South Sudan features vast grasslands, the White Nile River, and diverse ethnic cultures with traditional pastoral lifestyles.',
    landmarks: ['Boma National Park', 'Nimule National Park', 'Sudd Wetlands', 'Southern National Park'],
    cities: [
      { name: 'Juba', lat: 4.8517, lng: 31.5825, population: '525,953' },
      { name: 'Wau', lat: 7.7000, lng: 27.9833, population: '127,384' },
      { name: 'Malakal', lat: 9.5333, lng: 31.6500, population: '126,483' }
    ]
  },
  'Sudan': {
    name: 'Sudan',
    capital: 'Khartoum',
    population: '44.9 million',
    area: '1.886 million km²',
    description: 'Sudan features ancient pyramids, the confluence of the Blue and White Nile rivers, and vast desert landscapes.',
    landmarks: ['Meroe Pyramids', 'Dinder National Park', 'Sanganeb National Park', 'Taka Mountains'],
    cities: [
      { name: 'Khartoum', lat: 15.5007, lng: 32.5599, population: '5.2 million' },
      { name: 'Omdurman', lat: 15.6167, lng: 32.4833, population: '2.4 million' },
      { name: 'Port Sudan', lat: 19.6167, lng: 37.2167, population: '489,725' }
    ]
  },
  'Tanzania': {
    name: 'Tanzania',
    capital: 'Dodoma',
    population: '59.7 million',
    area: '947,303 km²',
    description: 'Tanzania features Mount Kilimanjaro, the Serengeti plains, Zanzibar archipelago, and rich wildlife.',
    landmarks: ['Mount Kilimanjaro', 'Serengeti National Park', 'Ngorongoro Crater', 'Stone Town'],
    cities: [
      { name: 'Dodoma', lat: -6.1722, lng: 35.7395, population: '410,956' },
      { name: 'Dar es Salaam', lat: -6.7924, lng: 39.2083, population: '6.7 million' },
      { name: 'Mwanza', lat: -2.5167, lng: 32.9000, population: '1.2 million' }
    ]
  },
  'Togo': {
    name: 'Togo',
    capital: 'Lomé',
    population: '8.3 million',
    area: '56,785 km²',
    description: 'Togo features hills, savannas, and lakes, known for its traditional markets and voodoo culture.',
    landmarks: ['Mount Agou', 'Koutammakou', 'Fazao Malfakassa National Park', 'Lake Togo'],
    cities: [
      { name: 'Lomé', lat: 6.1375, lng: 1.2123, population: '837,437' },
      { name: 'Sokodé', lat: 8.9833, lng: 1.1333, population: '117,811' },
      { name: 'Kara', lat: 9.5500, lng: 1.1833, population: '104,207' }
    ]
  },
  'Tunisia': {
    name: 'Tunisia',
    capital: 'Tunis',
    population: '11.7 million',
    area: '163,610 km²',
    description: 'Tunisia features Mediterranean beaches, Sahara Desert, ancient Roman ruins, and traditional medinas.',
    landmarks: ['Amphitheatre of El Jem', 'Medina of Tunis', 'Carthage Ruins', 'Bardo Museum'],
    cities: [
      { name: 'Tunis', lat: 36.8065, lng: 10.1815, population: '638,845' },
      { name: 'Sfax', lat: 34.7400, lng: 10.7600, population: '330,440' },
      { name: 'Sousse', lat: 35.8333, lng: 10.6333, population: '271,428' }
    ]
  },
  'Uganda': {
    name: 'Uganda',
    capital: 'Kampala',
    population: '45.7 million',
    area: '241,038 km²',
    description: 'Uganda is known as the "Pearl of Africa" for its stunning landscapes, diverse wildlife, and vibrant culture.',
    landmarks: ['Murchison Falls', 'Bwindi Impenetrable Forest', 'Lake Victoria', 'Rwenzori Mountains'],
    cities: [
      { name: 'Kampala', lat: 0.3476, lng: 32.5825, population: '1.5 million' },
      { name: 'Gulu', lat: 2.7747, lng: 32.2999, population: '152,276' },
      { name: 'Lira', lat: 2.2499, lng: 32.9000, population: '119,323' }
    ]
  },
  'Western Sahara': {
    name: 'Western Sahara',
    capital: 'El Aaiún (disputed)',
    population: '597,000',
    area: '266,000 km²',
    description: 'Western Sahara is a disputed territory in North Africa, bordered by Morocco, Algeria, and Mauritania. Its sovereignty remains contested between Morocco and the Sahrawi Arab Democratic Republic.',
    landmarks: ['Laayoune (El Aaiún)', 'Smara', 'Dakhla Peninsula', 'Western Sahara Wall'],
    cities: [
      { name: 'El Aaiún', lat: 27.1418, lng: -13.1632, population: '217,000' },
      { name: 'Dakhla', lat: 23.6848, lng: -15.9579, population: '106,000' },
      { name: 'Smara', lat: 26.7384, lng: -11.6719, population: '57,000' }
    ]
  },
  'Zambia': {
    name: 'Zambia',
    capital: 'Lusaka',
    population: '18.4 million',
    area: '752,618 km²',
    description: 'Zambia features Victoria Falls, diverse wildlife, and the Zambezi River, known for its natural beauty and safari experiences.',
    landmarks: ['Victoria Falls', 'South Luangwa National Park', 'Lower Zambezi National Park', 'Kariba Dam'],
    cities: [
      { name: 'Lusaka', lat: -15.4167, lng: 28.2833, population: '2.5 million' },
      { name: 'Kitwe', lat: -12.8024, lng: 28.2132, population: '504,194' },
      { name: 'Ndola', lat: -12.9587, lng: 28.6366, population: '455,194' }
    ]
  },
  'Zimbabwe': {
    name: 'Zimbabwe',
    capital: 'Harare',
    population: '14.8 million',
    area: '390,757 km²',
    description: 'Zimbabwe features ancient ruins, Victoria Falls, diverse wildlife, and the Eastern Highlands mountain range.',
    landmarks: ['Victoria Falls', 'Great Zimbabwe Ruins', 'Hwange National Park', 'Matobo Hills'],
    cities: [
      { name: 'Harare', lat: -17.8292, lng: 31.0522, population: '1.5 million' },
      { name: 'Bulawayo', lat: -20.1325, lng: 28.6262, population: '653,337' },
      { name: 'Chitungwiza', lat: -18.0127, lng: 31.0756, population: '371,244' }
    ]
  }
};

const nigerFlightPaths: FlightPath[] = [
  // Incoming flights to Niger
  {
    startLat: 6.5244, // Nigeria (Lagos)
    startLng: 3.3792,
    endLat: 13.5137, // Niger (Niamey)
    endLng: 2.1098,
    color: 'rgba(0, 100, 0, 0.3)', // Dark green with high transparency for incoming
    direction: 'in',
    label: 'Trade from Nigeria'
  },
  {
    startLat: 36.7538, // Algeria (Algiers)
    startLng: 3.0588,
    endLat: 13.5137, // Niger (Niamey)
    endLng: 2.1098,
    color: 'rgba(0, 100, 0, 0.3)', // Dark green with high transparency for incoming
    direction: 'in',
    label: 'Resources from Algeria'
  },
  {
    startLat: 12.6392, // Mali (Bamako)
    startLng: -8.0029,
    endLat: 13.5137, // Niger (Niamey)
    endLng: 2.1098,
    color: 'rgba(0, 100, 0, 0.3)', // Dark green with high transparency for incoming
    direction: 'in',
    label: 'Migration from Mali'
  },
  
  // Outgoing flights from Niger
  {
    startLat: 13.5137, // Niger (Niamey)
    startLng: 2.1098,
    endLat: 30.0444, // Egypt (Cairo)
    endLng: 31.2357,
    color: 'rgba(139, 0, 0, 0.3)', // Dark red with high transparency for outgoing
    direction: 'out',
    label: 'Exports to Egypt'
  },
  {
    startLat: 13.5137, // Niger (Niamey)
    startLng: 2.1098,
    endLat: 6.1731, // Ghana (Accra)
    endLng: -0.1822,
    color: 'rgba(139, 0, 0, 0.3)', // Dark red with high transparency for outgoing
    direction: 'out',
    label: 'Exports to Ghana'
  },
  {
    startLat: 13.5137, // Niger (Niamey)
    startLng: 2.1098,
    endLat: 12.3714, // Burkina Faso (Ouagadougou)
    endLng: -1.5197,
    color: 'rgba(139, 0, 0, 0.3)', // Dark red with high transparency for outgoing
    direction: 'out',
    label: 'Migration to Burkina Faso'
  }
];

function App() {
  const [countries, setCountries] = useState<{ features: CountryFeature[] }>({ features: [] });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [visibleSectors, setVisibleSectors] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [activeInfoPanel, setActiveInfoPanel] = useState<'country' | 'facility' | 'sector'>('country');
  const [error, setError] = useState<string | null>(null);
  const [arcsData, setArcsData] = useState<FlightPath[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [visibleFacilityGroups, setVisibleFacilityGroups] = useState<string[]>(['all']);
  const [showFacilityInfo, setShowFacilityInfo] = useState(false);
  const [showSectorInfo, setShowSectorInfo] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    'facilities': true,
    'sectors': true
  });
  const [selectedGlobeTexture, setSelectedGlobeTexture] = useState(globeTextures[0]);
  const [backgroundColorMode, setBackgroundColorMode] = useState<'white' | 'black'>('white');
  const globeRef = useRef<any>();

  // Group facilities by operator
  const facilityGroups = [
    {
      id: 'dp-world',
      name: 'DP World',
      color: '#e74c3c'
    },
    {
      id: 'ad-ports',
      name: 'AD Ports Group',
      color: '#2ecc71'
    },
    {
      id: 'other',
      name: 'Other Operators',
      color: '#3498db'
    },
    {
      id: 'all',
      name: 'All Facilities',
      color: '#9b59b6'
    }
  ];

  // List of sectors
  const sectors = [
    'Agriculture and Food Security',
    'Carbon Credits',
    'Construction',
    'Energy and Environment Projects',
    'Financial Services and Investments',
    'Healthcare',
    'Logistics and Infrastructure',
    'Manufacturing',
    'Marine Sector, Ports, Fisheries',
    'Military and Defense',
    'Mining',
    'Oil and Gas',
    'Real Estate',
    'Tech',
    'Textiles'
  ];

  // Load facilities data
  useEffect(() => {
    setFacilities(facilitiesData as Facility[]);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const world = await response.json();
        const countriesData = feature(world, world.objects.countries);
        setCountries(countriesData as any);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch countries data:', error);
        setError('Unable to load the globe data. Please check your internet connection and try again.');
      }
    };

    fetchData();
  }, []);

  // Filter visible facilities based on selected groups
  const visibleFacilities = useCallback(() => {
    if (visibleFacilityGroups.includes('all')) {
      return facilities;
    }
    
    return facilities.filter(facility => {
      if (visibleFacilityGroups.includes('dp-world') && facility.operator_name === 'DP World') {
        return true;
      }
      if (visibleFacilityGroups.includes('ad-ports') && facility.operator_name === 'AD Ports Group') {
        return true;
      }
      if (visibleFacilityGroups.includes('other') && 
          facility.operator_name !== 'DP World' && 
          facility.operator_name !== 'AD Ports Group') {
        return true;
      }
      return false;
    });
  }, [facilities, visibleFacilityGroups]);

  // Toggle facility group visibility
  const toggleFacilityGroup = useCallback((groupId: string) => {
    setVisibleFacilityGroups(prev => {
      // If toggling 'all', either add only 'all' or remove it
      if (groupId === 'all') {
        return prev.includes('all') ? prev.filter(id => id !== 'all') : ['all'];
      }
      
      // If 'all' is currently selected and we're selecting another group,
      // remove 'all' and add only the selected group
      if (prev.includes('all')) {
        return [groupId];
      }
      
      // Toggle the selected group
      return prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId];
    });
  }, []);

  // Toggle sector visibility
  const toggleSector = useCallback((sector: string) => {
    // If the sector is already selected, deselect it
    if (visibleSectors.includes(sector)) {
      setVisibleSectors(prev => prev.filter(s => s !== sector));
      
      // If this was the selected sector for the info panel, close the panel
      if (selectedSector === sector) {
        setSelectedSector(null);
        setShowSectorInfo(false);
        
        // If no other panels are open, reset the globe position
        if (!showInfo && !showFacilityInfo) {
          const globeEl = document.querySelector('.scene-container');
          if (globeEl) {
            globeEl.classList.remove('globe-left');
          }
        } else if (showInfo) {
          // If country info is still open, make it active
          setActiveInfoPanel('country');
        } else if (showFacilityInfo) {
          // If facility info is still open, make it active
          setActiveInfoPanel('facility');
        }
      }
    } else {
      // Add the sector to visible sectors
      setVisibleSectors(prev => [...prev, sector]);
      
      // Select this sector for the info panel
      selectSector(sector);
    }
  }, [visibleSectors, selectedSector, showInfo, showFacilityInfo]);

  // Select a sector and show its info panel
  const selectSector = useCallback((sector: string) => {
    setSelectedSector(sector);
    setShowSectorInfo(true);
    setActiveInfoPanel('sector');
    
    // Animate globe to the left if not already positioned
    const globeEl = document.querySelector('.scene-container');
    if (globeEl && !globeEl.classList.contains('globe-left')) {
      globeEl.classList.add('globe-left');
    }
    
    // Get the countries associated with this sector
    const sectorData = sectorsData.find(s => s.sector === sector);
    if (sectorData && sectorData.countries.length > 0) {
      // Find the center point of the first country in the list
      const firstCountry = sectorData.countries[0];
      const matchingCountryInfo = Object.values(countryInfo).find(
        country => country.name.toLowerCase() === firstCountry.toLowerCase()
      );
      
      if (matchingCountryInfo && matchingCountryInfo.cities.length > 0) {
        // Animate globe to the first city of the first country
        if (globeRef.current) {
          globeRef.current.pointOfView({
            lat: matchingCountryInfo.cities[0].lat,
            lng: matchingCountryInfo.cities[0].lng,
            altitude: 1.8
          }, 2000);
        }
      }
    }
  }, []);

  // Close sector info panel
  const closeSectorInfo = useCallback(() => {
    // Remove the selected sector from visible sectors
    if (selectedSector) {
      setVisibleSectors(prev => prev.filter(s => s !== selectedSector));
    }
    
    setShowSectorInfo(false);
    
    // If country info is still open, make it active
    if (showInfo) {
      setActiveInfoPanel('country');
    } else if (showFacilityInfo) {
      // If facility info is still open, make it active
      setActiveInfoPanel('facility');
    } else {
      // If no panels are open, reset the globe position
      const globeEl = document.querySelector('.scene-container');
      if (globeEl) {
        globeEl.classList.remove('globe-left');
      }
    }
    
    setTimeout(() => {
      setSelectedSector(null);
    }, 500);
  }, [showInfo, showFacilityInfo, selectedSector]);

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Handle facility click
  const handleFacilityClick = useCallback((facility: Facility) => {
    setSelectedFacility(facility);
    setShowFacilityInfo(true);
    setActiveInfoPanel('facility');
    
    // Animate globe to facility position
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: facility.latitude,
        lng: facility.longitude,
        altitude: 1.5
      }, 1000);
    }
    
    // Adjust globe position to the left if not already adjusted
    const globeEl = document.querySelector('.scene-container');
    if (globeEl && !globeEl.classList.contains('globe-left')) {
      globeEl.classList.add('globe-left');
    }
  }, []);

  // Close facility info panel
  const closeFacilityInfo = useCallback(() => {
    setShowFacilityInfo(false);
    
    // If country info is still open, make it active
    if (showInfo) {
      setActiveInfoPanel('country');
    } else {
      // If no panels are open, reset the globe position
      const globeEl = document.querySelector('.scene-container');
      if (globeEl) {
        globeEl.classList.remove('globe-left');
      }
    }
    
    setTimeout(() => {
      setSelectedFacility(null);
    }, 500);
  }, [showInfo]);

  const focusOnCountry = useCallback((country: CountryFeature) => {
    if (!country || !country.properties?.name) return;
    
    const countryName = country.properties.name;
    
    // Normalize country name for lookup
    let normalizedCountryName = countryName;
    if (countryName.toLowerCase() === 'eswatini') {
      normalizedCountryName = 'Eswatini';
    } else if (countryName === 'W. Sahara') {
      normalizedCountryName = 'Western Sahara';
    } else if (countryName === 'Côte d\'Ivoire') {
      normalizedCountryName = 'Ivory Coast';
    } else if (countryName === 'Eq. Guinea') {
      normalizedCountryName = 'Equatorial Guinea';
    } else if (countryName === 'Central African Rep.') {
      normalizedCountryName = 'Central African Republic';
    } else if (countryName === 'S. Sudan') {
      normalizedCountryName = 'South Sudan';
    } else if (countryName === 'Dem. Rep. Congo') {
      normalizedCountryName = 'Democratic Republic of the Congo';
    }
    
    if (countryInfo[normalizedCountryName]) {
      setSelectedCountry(normalizedCountryName);
      setSelectedFacility(null);
      setSelectedSector(null);
      setVisibleSectors([]);
      setActiveInfoPanel('country');
      
      // Find the country coordinates for centering
      const centerPoint = {
        lat: countryInfo[normalizedCountryName].cities[0].lat,
        lng: countryInfo[normalizedCountryName].cities[0].lng
      };
      
      // If Niger is selected, show the flight paths
      if (normalizedCountryName === 'Niger') {
        setArcsData(nigerFlightPaths);
      } else {
        setArcsData([]);
      }
      
      // Zoom to the country
      if (globeRef.current) {
        globeRef.current.pointOfView({
          lat: centerPoint.lat,
          lng: centerPoint.lng,
          altitude: 1.5
        }, 2000);

        // Adjust globe position to the left and show info panel
        setTimeout(() => {
          const globeEl = document.querySelector('.scene-container');
          if (globeEl) {
            globeEl.classList.add('globe-left');
          }
          setShowInfo(true);
        }, 500);
      }
    } else {
      console.log('No matching country info found for:', normalizedCountryName);
    }
  }, []);

  const resetView = useCallback(() => {
    if (!globeRef.current) return;

    setShowInfo(false);
    setArcsData([]);
    setShowFacilityInfo(false);
    
    setTimeout(() => {
      setSelectedCountry(null);
      setSelectedFacility(null);
      
      globeRef.current.pointOfView({
        lat: 0,
        lng: 0,
        altitude: 2.5
      }, 1000);

      const globeEl = document.querySelector('.scene-container');
      if (globeEl) {
        globeEl.classList.remove('globe-left');
      }
    }, 500);
  }, []);

  // Switch between info panels
  const switchInfoPanel = useCallback((panel: 'country' | 'facility' | 'sector') => {
    setActiveInfoPanel(panel);
  }, []);

  // Get marker color based on facility
  const getMarkerColor = useCallback((facility: Facility) => {
    if (facility.color === 'red') return '#e74c3c';
    if (facility.color === 'green') return '#2ecc71';
    if (facility.color === 'square') return '#3498db';
    return '#f39c12'; // default color
  }, []);

  // Get countries associated with selected sectors
  const getCountriesBySectors = useCallback(() => {
    if (visibleSectors.length === 0) return [];
    
    // Get all countries associated with the selected sectors
    const countriesSet = new Set<string>();
    
    visibleSectors.forEach(sector => {
      const sectorData = sectorsData.find(s => s.sector === sector);
      if (sectorData) {
        sectorData.countries.forEach(country => countriesSet.add(country));
      }
    });
    
    return Array.from(countriesSet);
  }, [visibleSectors]);

  // Get sector details
  const getSectorDetails = useCallback((sectorName: string) => {
    return sectorsDetailsData.find(sector => sector.sector === sectorName) as SectorDetails | null;
  }, []);

  const polygonCapColor = useCallback((d: any) => {
    const feature = d as CountryFeature;
    const sectorCountries = getCountriesBySectors();
    
    // Normalize country name for lookup
    let countryName = feature.properties?.name;
    if (countryName === 'eSwatini') {
      countryName = 'Eswatini';
    } else if (countryName === 'W. Sahara') {
      countryName = 'Western Sahara';
    } else if (countryName === 'Côte d\'Ivoire') {
      countryName = 'Ivory Coast';
    } else if (countryName === 'Eq. Guinea') {
      countryName = 'Equatorial Guinea';
    } else if (countryName === 'Central African Rep.') {
      countryName = 'Central African Republic';
    } else if (countryName === 'S. Sudan') {
      countryName = 'South Sudan';
    } else if (countryName === 'Dem. Rep. Congo') {
      countryName = 'Democratic Republic of the Congo';
    }
    
    const isSelected = selectedCountry && countryName?.toLowerCase() === selectedCountry.toLowerCase();
    const isInSelectedSector = sectorCountries.some(country => 
      country.toLowerCase() === countryName?.toLowerCase()
    );
    
    if (isInSelectedSector) {
      return 'rgba(0, 200, 100, 0.3)'; // Light green for sector-associated countries
    } else if (isSelected) {
      return 'rgba(0, 100, 200, 0.3)'; // Blue highlight for selected country
    } else {
      return 'rgba(0, 0, 0, 0.1)'; // Original default color
    }
  }, [selectedCountry, getCountriesBySectors]);

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-white to-gray-100 overflow-hidden">
      <style>{`
        .scene-container {
          transition: transform 1s ease-in-out;
        }
        .globe-left {
          transform: translateX(-20%);
        }
        .info-panel {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 40%;
          transform: translateX(100%);
          transition: transform 0.5s ease-in-out, opacity 0.3s ease-in-out;
          z-index: 50;
          pointer-events: auto;
          opacity: 0;
          background-color: white;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
          border-left: 1px solid #e2e8f0;
        }
        .info-panel.visible {
          transform: translateX(0);
          opacity: 1;
        }
        .info-panel.active {
          z-index: 51;
        }
        .info-panel.inactive {
          z-index: 50;
          opacity: 0;
          pointer-events: none;
        }
        .info-panel-content {
          height: 100%;
          width: 100%;
          overflow-y: auto;
          padding: 2rem;
        }
        .panel-tab {
          position: absolute;
          left: -40px;
          width: 40px;
          height: 120px;
          background-color: white;
          border: 1px solid #e2e8f0;
          border-right: none;
          border-top-left-radius: 8px;
          border-bottom-left-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
          transition: background-color 0.2s;
        }
        .panel-tab:hover {
          background-color: #f8fafc;
        }
        .panel-tab.active {
          background-color: #f0f9ff;
          border-left: 3px solid #3b82f6;
        }
        .panel-tab.country-tab {
          top: 100px;
        }
        .panel-tab.facility-tab {
          top: 230px;
        }
        .panel-tab.sector-tab {
          top: 360px;
        }
        .tab-icon {
          margin-bottom: 8px;
        }
        .tab-label {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .control-panel {
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          padding: 1rem;
          width: 280px;
          max-height: calc(100vh - 2rem);
          overflow-y: auto;
        }
        .facility-checkbox {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          cursor: pointer;
        }
        .facility-checkbox input {
          margin-right: 0.5rem;
        }
        .color-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: inline-block;
          margin-right: 0.5rem;
        }
        .sector-checkbox {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
          cursor: pointer;
        }
        .sector-checkbox input {
          margin-right: 0.5rem;
        }
        .sector-label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
        .section-header {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }
        .section-header button {
          margin-left: 0.5rem;
          font-size: 14px;
          font-weight: 500;
          color: #666;
          background-color: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
        }
        .section-header button:hover {
          color: #333;
        }
        .section-content {
          margin-bottom: 1rem;
        }
        .section-content.expanded {
          display: block;
        }
        .section-content.collapsed {
          display: none;
        }
      `}</style>

      <div className="absolute top-4 left-4 z-10">
        <div className="control-panel">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Map Controls</h3>
          
          <div className="mb-4">
            <label htmlFor="texture-select" className="block text-sm font-medium text-gray-700 mb-2">
              Globe Texture
            </label>
            <select
              id="texture-select"
              value={selectedGlobeTexture.id}
              onChange={(e) => {
                const texture = globeTextures.find(t => t.id === e.target.value);
                if (texture) setSelectedGlobeTexture(texture);
              }}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {globeTextures.map(texture => (
                <option key={texture.id} value={texture.id}>
                  {texture.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="background-select" className="block text-sm font-medium text-gray-700 mb-2">
              Background Color
            </label>
            <select
              id="background-select"
              value={backgroundColorMode}
              onChange={(e) => setBackgroundColorMode(e.target.value as 'white' | 'black')}
              className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="white">White</option>
              <option value="black">Black</option>
            </select>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="section-header">
              <span>Facility Visibility</span>
              <button onClick={() => toggleSection('facilities')}>
                {expandedSections['facilities'] ? '▼' : '►'}
              </button>
            </div>
            
            <div className={`section-content ${expandedSections['facilities'] ? 'expanded' : 'collapsed'}`}>
              {facilityGroups.map(group => (
                <label key={group.id} className="facility-checkbox">
                  <input
                    type="checkbox"
                    checked={visibleFacilityGroups.includes(group.id)}
                    onChange={() => toggleFacilityGroup(group.id)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="color-indicator" style={{ backgroundColor: group.color }}></span>
                  <span className="text-sm text-gray-700">{group.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="section-header">
              <span>Sectors</span>
              <button onClick={() => toggleSection('sectors')}>
                {expandedSections['sectors'] ? '▼' : '►'}
              </button>
            </div>
            
            <div className={`section-content ${expandedSections['sectors'] ? 'expanded' : 'collapsed'}`}>
              {sectors.map(sector => (
                <label key={sector} className="sector-checkbox">
                  <input
                    type="checkbox"
                    checked={visibleSectors.includes(sector)}
                    onChange={() => toggleSector(sector)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="sector-label">{sector}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4">
            <p className="text-xs text-gray-500">
              Click on any facility marker to view detailed information.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="absolute top-4 right-4 z-10 bg-red-50 text-red-700 px-4 py-3 rounded-lg shadow-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="absolute inset-0">
        <Globe
          ref={globeRef}
          globeImageUrl={selectedGlobeTexture.url}
          backgroundImageUrl={backgroundColorMode === 'black' ? "//unpkg.com/three-globe/example/img/night-sky.png" : undefined}
          backgroundColor={backgroundColorMode === 'white' ? "#ffffff" : "rgba(0,0,0,0)"}
          polygonsData={countries.features}
          polygonAltitude={0.01}
          polygonCapColor={polygonCapColor}
          polygonSideColor={() => 'rgba(0, 100, 0, 0.15)'}
          polygonStrokeColor={() => '#111'}
          polygonLabel={(d: any) => {
            const feature = d as CountryFeature;
            // Handle special cases for country names
            if (feature.properties?.name === 'eSwatini') {
              return `<b>Eswatini</b>`;
            } else if (feature.properties?.name === 'W. Sahara') {
              return `<b>Western Sahara</b>`;
            } else if (feature.properties?.name === 'Côte d\'Ivoire') {
              return `<b>Ivory Coast</b>`;
            } else if (feature.properties?.name === 'Eq. Guinea') {
              return `<b>Equatorial Guinea</b>`;
            } else if (feature.properties?.name === 'Central African Rep.') {
              return `<b>Central African Republic</b>`;
            } else if (feature.properties?.name === 'S. Sudan') {
              return `<b>South Sudan</b>`;
            } else if (feature.properties?.name === 'Dem. Rep. Congo') {
              return `<b>Democratic Republic of the Congo</b>`;
            }
            return `<b>${feature.properties?.name}</b>`;
          }}
          onPolygonHover={() => {}} 
          onPolygonClick={(polygon: any) => {
            const feature = polygon as CountryFeature;
            if (feature.properties?.name) {
              // Handle special cases for country names
              if (feature.properties.name === 'eSwatini') {
                focusOnCountry({ ...feature, properties: { ...feature.properties, name: 'Eswatini' } });
              } else if (feature.properties.name === 'W. Sahara') {
                focusOnCountry({ ...feature, properties: { ...feature.properties, name: 'Western Sahara' } });
              } else if (feature.properties.name === 'Côte d\'Ivoire') {
                focusOnCountry({ ...feature, properties: { ...feature.properties, name: 'Ivory Coast' } });
              } else if (feature.properties.name === 'Eq. Guinea') {
                focusOnCountry({ ...feature, properties: { ...feature.properties, name: 'Equatorial Guinea' } });
              } else if (feature.properties.name === 'Central African Rep.') {
                focusOnCountry({ ...feature, properties: { ...feature.properties, name: 'Central African Republic' } });
              } else if (feature.properties.name === 'S. Sudan') {
                focusOnCountry({ ...feature, properties: { ...feature.properties, name: 'South Sudan' } });
              } else if (feature.properties.name === 'Dem. Rep. Congo') {
                focusOnCountry({ ...feature, properties: { ...feature.properties, name: 'Democratic Republic of the Congo' } });
              } else {
                focusOnCountry(feature);
              }
            }
          }}
          arcsData={arcsData}
          arcColor={(d: any) => d.color}
          arcStroke={1.0} // Thin arcs
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcAltitude={0.05} // Keep arcs flat
          arcLabel={(d: any) => d.label}
          arcsTransitionDuration={1500}
          pointsData={visibleFacilities()}
          pointLat="latitude"
          pointLng="longitude"
          pointColor={(d: any) => {
            const facility = d as Facility;
            return getMarkerColor(facility);
          }}
          pointAltitude={0.01}
          pointRadius={0.25}
          pointsMerge={false}
          onPointClick={(point: any) => {
            const facility = point as Facility;
            handleFacilityClick(facility);
          }}
          pointLabel={(d: any) => {
            const facility = d as Facility;
            return `
              <div class="bg-white rounded-lg p-2 shadow-lg">
                <div class="font-bold text-gray-800">${facility.facility_name}</div>
                <div class="text-sm text-gray-600">${facility.facility_type} in ${facility.country_name}</div>
              </div>
            `;
          }}
        />
        
        {/* Add CSS for styling the arcs */}
        <style>
          {`
          .arc-path {
            filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.5));
          }
          `}
        </style>
      </div>

      {/* Country Info Panel */}
      <div className={`info-panel ${showInfo ? 'visible' : ''} ${activeInfoPanel === 'country' ? 'active' : 'inactive'}`}>
        {showInfo && selectedCountry && countryInfo[selectedCountry] && (
          <>
            {/* Tab for country panel */}
            <div 
              className={`panel-tab country-tab ${activeInfoPanel === 'country' ? 'active' : ''}`}
              onClick={() => switchInfoPanel('country')}
            >
              <GlobeIconSolid className="tab-icon w-6 h-6 text-blue-600" />
              <span className="tab-label">Country</span>
            </div>
            
            <div className="info-panel-content">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <GlobeIcon className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-800">{countryInfo[selectedCountry].name}</h2>
                </div>
                <button
                  onClick={resetView}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Capital</p>
                    <p className="font-medium text-gray-900">{countryInfo[selectedCountry].capital}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Population</p>
                    <p className="font-medium text-gray-900">{countryInfo[selectedCountry].population}</p>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Area</p>
                    
                    <p className="font-medium text-gray-900">{countryInfo[selectedCountry].area}</p>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700">{countryInfo[selectedCountry].description}</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Notable Landmarks</h3>
                  <ul className="space-y-2">
                    {countryInfo[selectedCountry].landmarks.map(landmark => (
                      <li key={landmark} className="bg-gray-50 p-3 rounded-lg text-gray-700">
                        {landmark}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">Major Cities</h3>
                  <div className="space-y-2">
                    {countryInfo[selectedCountry].cities.map(city => (
                      <div key={city.name} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium text-gray-800">{city.name}</span>
                        <span className="text-gray-600">{city.population}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Facility Info Panel */}
      <div className={`info-panel ${showFacilityInfo ? 'visible' : ''} ${activeInfoPanel === 'facility' ? 'active' : 'inactive'}`}>
        {showFacilityInfo && selectedFacility && (
          <>
            {/* Tab for facility panel */}
            <div 
              className={`panel-tab facility-tab ${activeInfoPanel === 'facility' ? 'active' : ''}`}
              onClick={() => switchInfoPanel('facility')}
            >
              <MapPin className="tab-icon w-6 h-6 text-red-500" />
              <span className="tab-label">Facility</span>
            </div>
            
            <div className="info-panel-content">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getMarkerColor(selectedFacility) }}
                  >
                    <span className="text-white text-xs font-bold">F</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{selectedFacility.facility_name}</h2>
                </div>
                <button
                  onClick={closeFacilityInfo}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedFacility.facility_type}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Country</p>
                    <p className="font-medium text-gray-900">{selectedFacility.country_name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Operator</p>
                    <p className="font-medium text-gray-900">{selectedFacility.operator_name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium text-gray-900 capitalize">{selectedFacility.status}</p>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Operator Type</p>
                    <p className="font-medium text-gray-900">{selectedFacility.operator_type}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Latitude</p>
                    <p className="font-medium text-gray-900">{selectedFacility.latitude.toFixed(4)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Longitude</p>
                    <p className="font-medium text-gray-900">{selectedFacility.longitude.toFixed(4)}</p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-purple-600" />
                    Facility Details
                  </h3>
                  <p className="text-gray-700">
                    This {selectedFacility.facility_type} facility is located in {selectedFacility.country_name} and is {selectedFacility.status} by {selectedFacility.operator_name}, 
                    which is a {selectedFacility.operator_type}.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sector Info Panel */}
      <div className={`info-panel ${showSectorInfo ? 'visible' : ''} ${activeInfoPanel === 'sector' ? 'active' : 'inactive'}`}>
        {showSectorInfo && selectedSector && (
          <>
            {/* Tab for sector panel */}
            <div 
              className={`panel-tab sector-tab ${activeInfoPanel === 'sector' ? 'active' : ''}`}
              onClick={() => switchInfoPanel('sector')}
            >
              <Briefcase className="tab-icon w-6 h-6 text-purple-600" />
              <span className="tab-label">Sector</span>
            </div>
            
            <div className="info-panel-content">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500"
                  >
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800">{selectedSector}</h2>
                </div>
                <button
                  onClick={closeSectorInfo}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {(() => {
                  const sectorDetails = getSectorDetails(selectedSector);
                  
                  if (!sectorDetails) {
                    return (
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-yellow-700">No detailed information available for this sector.</p>
                      </div>
                    );
                  }
                  
                  return (
                    <>
                      {/* Description */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-purple-600" />
                          Description
                        </h3>
                        <p className="text-gray-700">{sectorDetails.description}</p>
                      </div>
                      
                      {/* Investment Details */}
                      {sectorDetails.investment_details && sectorDetails.investment_details !== "No detailed investment information available" && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-purple-600" />
                            Investment Details
                          </h3>
                          <p className="text-gray-700">{sectorDetails.investment_details}</p>
                        </div>
                      )}
                      
                      {/* Major Projects */}
                      {sectorDetails.major_projects && sectorDetails.major_projects.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-blue-600" />
                            Major Projects
                          </h3>
                          <ul className="list-disc pl-5 text-gray-700">
                            {sectorDetails.major_projects.map((project: string, index: number) => (
                              <li key={index}>{project}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Security Risks */}
                      {sectorDetails.security_risks && sectorDetails.security_risks.length > 0 && (
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                            Security Risks
                          </h3>
                          <ul className="list-disc pl-5 text-red-700">
                            {sectorDetails.security_risks.map((risk: string, index: number) => (
                              <li key={index}>{risk}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Mitigation Capabilities */}
                      {sectorDetails.mitigation_capabilities && sectorDetails.mitigation_capabilities.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-green-600" />
                            Mitigation Capabilities
                          </h3>
                          <ul className="list-disc pl-5 text-green-700">
                            {sectorDetails.mitigation_capabilities.map((capability: string, index: number) => (
                              <li key={index}>{capability}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Bilateral Agreements */}
                      {sectorDetails.bilateral_agreements && sectorDetails.bilateral_agreements.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Bilateral Agreements
                          </h3>
                          <ul className="list-disc pl-5 text-blue-700">
                            {sectorDetails.bilateral_agreements.map((agreement: string, index: number) => (
                              <li key={index}>{agreement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Entities */}
                      {sectorDetails.entities && sectorDetails.entities.length > 0 && (
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
                            <Building className="w-5 h-5 mr-2 text-indigo-600" />
                            Key Entities
                          </h3>
                          <div className="space-y-4">
                            {sectorDetails.entities.map((entity: {name: string, logo: string, description: string}, index: number) => {
                              // Determine the logo path
                              let logoPath = '';
                              if (entity.logo === 'ihc_logo.png') {
                                logoPath = '/images/logos/IHC.png';
                              } else if (entity.logo === 'irh_logo.png') {
                                logoPath = '/images/logos/IRH.png';
                              }
                              
                              return (
                                <div key={index} className="flex items-center bg-white p-3 rounded-lg shadow-sm">
                                  <div className="w-12 h-12 mr-4 flex-shrink-0 rounded overflow-hidden">
                                    <img 
                                      src={logoPath}
                                      alt={`${entity.name} logo`}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-indigo-900">{entity.name}</h4>
                                    <p className="text-sm text-gray-600">{entity.description}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Countries */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                          <GlobeIcon className="w-5 h-5 mr-2 text-purple-600" />
                          Countries Involved
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                          {sectorDetails.countries.map((country: {name: string, investment_type: string, security_risks: string[], mitigation_capabilities: string[], projects?: string[]}, index: number) => (
                            <div 
                              key={index} 
                              className="bg-white p-2 rounded border border-gray-200 text-sm cursor-pointer hover:bg-purple-50"
                              onClick={() => {
                                if (countryInfo[country.name]) {
                                  focusOnCountry({ properties: { name: country.name } } as CountryFeature);
                                  switchInfoPanel('country');
                                }
                              }}
                            >
                              {country.name}
                              
                              {/* Show project details for specific countries */}
                              {'projects' in country && country.projects && country.projects.length > 0 && (
                                <div className="mt-1 text-xs text-gray-500">
                                  <strong>Projects:</strong>
                                  <ul className="list-disc pl-4 mt-1">
                                    {country.projects.map((project, idx) => (
                                      <li key={idx}>{project}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Show country-specific security risks */}
                              {'security_risks' in country && country.security_risks && country.security_risks.length > 0 && (
                                <div className="mt-1 text-xs text-red-500">
                                  <strong>Risks:</strong> {country.security_risks.length} identified
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;