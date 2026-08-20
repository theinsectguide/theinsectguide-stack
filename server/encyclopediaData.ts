import { SpeciesEntry } from './types';

export const ENCYCLOPEDIA_SPECIES: SpeciesEntry[] = [
  {
    id: 'vespa-crabro',
    common_name: 'European Hornet',
    latin_name: 'Vespa crabro',
    category: 'Dangerous',
    danger_level: 6,
    can_sting: true,
    can_bite: true,
    stinger_type: 'smooth',
    can_sting_repeatedly: true,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'Moderate',
    pet_child_explanation: 'Hornets deliver a painful sting with repeat attack capability. Keep children and curious pets away from flying corridors and nests.',
    regions: ['UK', 'EU', 'US'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active from spring through autumn, with peak worker activity during warmer summer months depending on regional climate.',
    habitat: 'Deciduous woodlands, hollow tree cavities, sheltered eaves, attics, and garden outbuildings.',
    description: 'European hornets are a large native social wasp species found across parts of Europe and established in eastern North America. Workers typically measure around 25–35 mm in length, with queens noticeably larger. They are characterized by a reddish-brown head and anterior thorax, paired with a yellow abdomen patterned with dark lateral spots. European hornets are effective natural predators of various insect species and nest primarily in sheltered cavities.',
    first_aid: 'Wash sting site immediately with soap and water. Apply an ice pack wrapped in a cloth for 15 minutes. Take an over-the-counter antihistamine if swelling occurs. Do NOT attempt to scrape out a stinger unless visibly left behind.',
    when_to_call_emergency: 'Call emergency services (999/911/112) immediately if stung in the mouth or throat, or if signs of anaphylaxis develop (wheezing, lip/tongue swelling, severe dizziness, full-body hives).',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Vespa_crabro_01.jpg/800px-Vespa_crabro_01.jpg',
    look_alikes: ['Asian Hornet (Vespa velutina)', 'Common Yellowjacket (Vespula vulgaris)', 'Giant Woodwasp (Urocerus gigas)'],
    fun_fact: 'European hornets are effective predators of flies, caterpillars, grasshoppers and other insects. Unlike honeybees, they possess a smooth stinger that can be used repeatedly without dying.',
    conservation_status: 'Least Concern (IUCN)',
    legal_protection_status: 'Location dependent — Specially protected under national nature conservation law in Germany (§44 BNatSchG; nests cannot be destroyed without permit), but not protected in the UK or North America.',
    country_top_ten: [
      { country: 'UK', rank: 6, danger_summary: 'Deep venomous sting, defensive of nest cavities.' },
      { country: 'EU', rank: 4, danger_summary: 'Potent sting with acetylcholine neurotransmitter component.' }
    ]
  },
  {
    id: 'apis-mellifera',
    common_name: 'Western Honeybee',
    latin_name: 'Apis mellifera',
    category: 'Useful',
    danger_level: 2,
    can_sting: true,
    can_bite: false,
    stinger_type: 'barbed',
    can_sting_repeatedly: false,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Low',
    pet_child_explanation: 'Docile keystone pollinator. Stings primarily in defense of the hive or when physically compressed, stepped on, or trapped. Stings can trigger allergic reactions in sensitive individuals.',
    regions: ['UK', 'US', 'CA', 'AU', 'EU'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active year-round within established colonies. Foraging activity varies seasonally with ambient temperature and local climate.',
    habitat: 'Gardens, agricultural orchards, meadows, and managed apiaries.',
    description: 'Indispensable pollinator insect characterized by fuzzy amber-brown coloration and pollen baskets on hind legs. Stings primarily in defense of the hive or when physically compressed, stepped on, or trapped. Stings can trigger allergic reactions in sensitive individuals.',
    first_aid: 'Promptly scrape off the barbed stinger using a fingernail or flat plastic card without squeezing the venom sac. Wash area with cold water and soap, and apply an ice pack for 10-15 minutes.',
    when_to_call_emergency: 'Seek urgent emergency medical care if systemic allergic symptoms, breathing difficulties, swelling of the lips, tongue or airway, or dizziness develop (anaphylaxis).',
    photo_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Hoverfly (Syrphidae)', 'Mason Bee (Osmia)', 'Mining Bee (Andrena)'],
    fun_fact: 'Honey bees communicate the location of food sources through the waggle dance. Worker bees are female and perform different roles within the colony, including nursing, guarding and foraging.',
    conservation_status: 'Not established in current reference data',
    legal_protection_status: 'Location dependent — Managed extensively via apiculture; beekeeping regulations and health inspections apply by jurisdiction.',
    country_top_ten: []
  },
  {
    id: 'vespula-vulgaris',
    common_name: 'Common Yellowjacket Wasp',
    latin_name: 'Vespula vulgaris',
    category: 'Dangerous',
    danger_level: 7,
    can_sting: true,
    can_bite: true,
    stinger_type: 'smooth',
    can_sting_repeatedly: true,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'Moderate',
    pet_child_explanation: 'Can sting repeatedly and aggressively defend underground or wall void nests. Scavenges sugary foods around outdoor dining areas.',
    regions: ['UK', 'EU', 'US', 'CA', 'AU'],
    active_seasons: ['Summer', 'Autumn', 'Spring'],
    active_season_details: 'Active from late spring through autumn, with sweet-scavenging and foraging intensity peaking during late summer.',
    habitat: 'Underground burrows, wall voids, compost bins, fruit orchards, and suburban gardens.',
    description: 'Social wasp species with bright yellow and black abdominal banding and lance-like smooth stinger capable of delivering repeated stings. Defends underground, wall cavity, or attic nests when disturbed.',
    first_aid: 'Wash area with antiseptic soap. Apply a cold compress wrapped in cloth. Take oral antihistamines or mild analgesics to manage swelling and localized pain.',
    when_to_call_emergency: 'Call emergency services (911/999/112) immediately if stung in the mouth or airway, or if systemic symptoms such as difficulty breathing, lightheadedness, or full-body hives appear.',
    photo_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['German Wasp (Vespula germanica)', 'European Hornet (Vespa crabro)', 'Hoverfly (Harmless mimic)'],
    fun_fact: 'In late summer, as the queen stops laying worker eggs, worker wasps transition their foraging from protein to carbohydrates and frequently seek ripe fruit or sweet drinks.',
    conservation_status: 'Least Concern (IUCN)',
    legal_protection_status: 'Not protected; managed as a stinging pest when nesting in close proximity to human dwellings.',
    country_top_ten: [
      { country: 'UK', rank: 4, danger_summary: 'Leading source of allergic anaphylaxis stings in late summer picnics.' },
      { country: 'CA', rank: 2, danger_summary: 'Aggressive ground-nesting defender throughout Canadian summers.' }
    ]
  },
  {
    id: 'bombus-spp',
    common_name: 'Bumblebee',
    latin_name: 'Bombus spp.',
    category: 'Useful',
    danger_level: 2,
    can_sting: true,
    can_bite: false,
    stinger_type: 'smooth',
    can_sting_repeatedly: true,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Low',
    pet_child_explanation: 'Gentle, non-aggressive pollinator. Only stings if severely crushed, stepped on, or nest is directly disturbed.',
    regions: ['UK', 'EU', 'US', 'CA'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Early spring through autumn depending on temperature and floral nectar availability.',
    habitat: 'Gardens, meadows, hedgerows, parks, and agricultural fields.',
    description: 'Plump, densely furred social bee vital for buzz-pollination of wild plants and agricultural crops such as tomatoes. Very docile and reluctant to sting unless trapped, stepped on, or nest is physically disturbed.',
    first_aid: 'Wash area with soap and water. Apply a cool compress to soothe localized swelling and discomfort.',
    when_to_call_emergency: 'Seek immediate medical attention if allergic reactions, airway swelling, or breathing difficulty occurs.',
    photo_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Honeybee (Apis mellifera)', 'Carpenter Bee (Xylocopa)', 'Bee Fly (Bombylius)'],
    fun_fact: 'Bumblebees can vibrate their flight muscles at high frequency without flying—a technique known as buzz pollination that releases tightly held pollen from flowers.',
    conservation_status: 'Varies by species (Several wild Bombus species are in decline; many common species are Least Concern)',
    legal_protection_status: 'Location dependent — General species are unprotected, though several threatened wild Bombus species receive statutory protection under regional biodiversity legislation.',
    country_top_ten: [
      { country: 'CA', rank: 8, danger_summary: 'Docile pollinator, but stings if crushed or nest disturbed.' }
    ]
  },
  {
    id: 'syrphidae',
    common_name: 'Marmalade Hoverfly',
    latin_name: 'Episyrphus balteatus',
    category: 'Useful',
    danger_level: 0,
    can_sting: false,
    can_bite: false,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Low',
    pet_child_explanation: 'Non-venomous pollinator lacking a stinger and venom-delivery apparatus. Hoverflies (syrphes) do not pose a stinging threat to humans or pets.',
    regions: ['UK', 'EU', 'US', 'CA', 'AU'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active during warmer months from spring through autumn, particularly on sunny, windless days.',
    habitat: 'Gardens, flower beds, meadows, agricultural fields, and woodland borders.',
    description: 'Beneficial true fly (family Syrphidae / syrphe) that mimics the yellow-and-black warning coloration of wasps and bees (Batesian mimicry). Adults have only two wings, large compound eyes, and short antennae. They are non-venomous and possess no stinger or biting mouthparts.',
    first_aid: 'Non-venomous and non-stinging, lacking a venom-delivery apparatus. No medical first aid is required.',
    when_to_call_emergency: 'None.',
    photo_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Common Yellowjacket (Vespula vulgaris)', 'Western Honeybee (Apis mellifera)', 'Paper Wasp (Polistes)'],
    fun_fact: 'Hoverfly larvae of many common species are voracious predators of aphids, making them doubly beneficial alongside their role as adult flower pollinators.',
    conservation_status: 'Least Concern (IUCN)',
    legal_protection_status: 'Location dependent — General pollinator without statutory restrictions; habitat conservation is encouraged in agricultural stewardship schemes.',
    country_top_ten: []
  },
  {
    id: 'coccinella-septempunctata',
    common_name: 'Seven-Spotted Ladybird',
    latin_name: 'Coccinella septempunctata',
    category: 'Useful',
    danger_level: 0,
    can_sting: false,
    can_bite: false,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Low',
    pet_child_explanation: 'Non-venomous and non-stinging, posing negligible risk to humans and domestic pets. Beneficial predator of aphids.',
    regions: ['UK', 'EU', 'US', 'CA'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active from spring through autumn, overwintering in sheltered leaf litter or bark crevices.',
    habitat: 'Gardens, crop fields, shrublands, meadows, and rose bushes.',
    description: 'Classic beneficial beetle with bright scarlet wing covers and seven distinctive black dots. Renowned natural biological control predator of plant-damaging aphids and scale insects.',
    first_aid: 'Non-venomous and non-stinging, lacking a venom-delivery apparatus. No specific medical treatment is generally required.',
    when_to_call_emergency: 'None.',
    photo_url: 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Harlequin Ladybird (Harmonia axyridis)', 'Two-Spotted Ladybird (Adalia bipunctata)'],
    fun_fact: 'When threatened, ladybirds can exude small droplets of bitter, yellow reflex blood from their leg joints to deter birds and small predators.',
    conservation_status: 'Least Concern (IUCN)',
    legal_protection_status: 'Location dependent — Not subject to statutory restrictions; recognized as beneficial biological control in agricultural guidelines.',
    country_top_ten: []
  },
  {
    id: 'vespa-velutina',
    common_name: 'Asian Hornet (Yellow-legged Hornet)',
    latin_name: 'Vespa velutina nigrithorax',
    category: 'Dangerous',
    danger_level: 8,
    can_sting: true,
    can_bite: true,
    stinger_type: 'smooth',
    can_sting_repeatedly: true,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'High',
    pet_child_explanation: 'Aggressive defensive swarming behavior near nests. Invasive apex predator of honeybees.',
    regions: ['UK', 'EU'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active from spring through autumn, with predation and flight activity peaking during late summer around apiaries.',
    habitat: 'Tree canopies, hedgerows, human buildings, and apiaries.',
    description: 'Invasive predatory hornet with a velvety dark brown thorax, yellow tipped legs, and a prominent orange segment on the abdomen. Highly destructive predator of domestic honeybee colonies.',
    first_aid: 'Wash the sting thoroughly with soap and water. Apply an ice pack for 15 minutes. Take oral antihistamines. Seek emergency help if multiple stings occur or allergic signs appear.',
    when_to_call_emergency: 'Call emergency services (999/112) immediately if throat swelling, dizziness, or breathing issues occur, or if stung in the head/neck area.',
    photo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Vespa_crabro_01.jpg/800px-Vespa_crabro_01.jpg',
    look_alikes: ['European Hornet (Vespa crabro)', 'Giant Woodwasp (Urocerus gigas)'],
    fun_fact: 'Asian hornets are specialized predators of honeybees, hovering outside hives to capture returning foragers and carry them back to nourish developing larvae.',
    conservation_status: 'Invasive species of high concern across UK and EU',
    legal_protection_status: 'Invasive alien species subject to statutory reporting and official eradication protocols in the UK and EU.',
    country_top_ten: [
      { country: 'UK', rank: 2, danger_summary: 'Major ecological invasive threat with potent defensive venom.' },
      { country: 'EU', rank: 3, danger_summary: 'Rapidly spreading invasive hornet causing severe allergic hospitalizations.' }
    ]
  },
  {
    id: 'atrox-robustus',
    common_name: 'Sydney Funnel-Web Spider',
    latin_name: 'Atrax robustus',
    category: 'Venomous',
    danger_level: 10,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'High',
    pet_child_explanation: 'Possesses delta-atracotoxin venom capable of causing severe neurotoxic symptoms. High hazard.',
    regions: ['AU'],
    active_seasons: ['Summer', 'Autumn'],
    active_season_details: 'Activity increases during warmer months in summer and autumn, particularly following humid weather and heavy rain.',
    habitat: 'Moist sheltered burrows under logs, gardens, and swimming pool filtration boxes in Sydney basin.',
    description: 'One of the world’s most venomous arachnids. Stocky, dark brown to black glossy carapace with powerful downward-striking fangs containing delta-atracotoxin.',
    first_aid: 'Apply pressure immobilization bandage (PIB) firmly over the entire bitten limb. Keep patient completely still and quiet. Call 000 emergency services without delay.',
    when_to_call_emergency: 'Suspected Sydney Funnel-Web bites are critical medical emergencies requiring immediate ambulance dispatch (000 in Australia) and urgent hospital treatment.',
    photo_url: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Mouse Spider (Missulena)', 'Trapdoor Spider (Idiopidae)'],
    fun_fact: 'Specific antivenom is available and can be highly effective when administered promptly. Suspected Sydney Funnel-Web bites remain medical emergencies requiring urgent medical treatment.',
    conservation_status: 'Not evaluated',
    legal_protection_status: 'Native Australian arachnid; collected under scientific venom extraction programs.',
    country_top_ten: [
      { country: 'AU', rank: 1, danger_summary: 'World-renowned medical emergency; bites require immediate antivenom.' }
    ]
  },
  {
    id: 'loxosceles-reclusa',
    common_name: 'Brown Recluse Spider',
    latin_name: 'Loxosceles reclusa',
    category: 'Venomous',
    danger_level: 9,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'High',
    pet_child_explanation: 'Possesses cytotoxic sphingomyelinase D venom capable of causing necrotic skin lesions. High hazard.',
    regions: ['US'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active primarily during warmer months; indoor populations remain active year-round in temperature-controlled buildings.',
    habitat: 'Undisturbed indoor closets, attics, cardboard boxes, crawlspaces, and woodpiles.',
    description: 'Tan to dark brown spider characterized by a distinctive violin-shaped mark on its cephalothorax and having 6 eyes arranged in pairs (dyads) rather than 8.',
    first_aid: 'Wash bite with antiseptic soap and water. Apply cold compress (10 min on, 10 min off). Elevate the limb. Seek prompt medical evaluation.',
    when_to_call_emergency: 'Visit Urgent Care or ER if the central bite area turns dark purple/black (necrosis) or if spreading ulceration, fever, or chills develop.',
    photo_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Southern House Spider (Kukulcania)', 'Cellar Spider (Pholcidae)', 'Wolf Spider'],
    fun_fact: 'Brown recluse spiders are nocturnal and prefer flight over fight; most bites occur when someone puts on clothing where a spider is trapped.',
    conservation_status: 'Least Concern',
    legal_protection_status: 'Not protected.',
    country_top_ten: [
      { country: 'US', rank: 2, danger_summary: 'Cytotoxic venom causes severe dermonecrotic ulceration requiring medical intervention.' }
    ]
  },
  {
    id: 'ixodes-scapularis',
    common_name: 'Deer Tick (Blacklegged Tick)',
    latin_name: 'Ixodes scapularis',
    category: 'Dangerous',
    danger_level: 8,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'High',
    pet_child_explanation: 'Vector for Lyme disease, Babesiosis, and Anaplasmosis in humans and domestic animals.',
    regions: ['US', 'CA'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active across warmer months from early spring through late autumn whenever ambient temperatures remain above freezing.',
    habitat: 'Forest leaf litter, tall grass margins, nature trails, and coastal shrubs.',
    description: 'Ixodes scapularis is a North American tick found primarily in eastern and central parts of the United States and southern Canada. It is an important vector of Lyme disease and can transmit other pathogens including those responsible for babesiosis and Powassan virus. In Europe, the related Castor Bean Tick, Ixodes ricinus, is an important vector of Lyme borreliosis.',
    first_aid: 'Grasp tick close to the skin with fine-point tweezers. Pull straight out firmly without twisting. Disinfect bite site with rubbing alcohol. Note the date of removal.',
    when_to_call_emergency: 'Contact physician promptly if an expanding circular rash (Erythema migrans), fever, facial palsy, or joint inflammation emerges in subsequent weeks.',
    photo_url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['American Dog Tick (Dermacentor variabilis)', 'Lone Star Tick (Amblyomma americanum)'],
    fun_fact: 'Tick nymphs are as tiny as a poppy seed (around 1–2 mm), making them easy to overlook without meticulous full-body inspections.',
    conservation_status: 'Not evaluated',
    legal_protection_status: 'Not protected; vector of public health significance.',
    country_top_ten: [
      { country: 'US', rank: 1, danger_summary: 'Major tick vector transmitting Lyme disease, Anaplasmosis, and Powassan virus.' },
      { country: 'CA', rank: 1, danger_summary: 'Leading tick vector for Lyme complications across southern Canada.' }
    ]
  },
  {
    id: 'ixodes-ricinus',
    common_name: 'Castor Bean Tick (Sheep Tick)',
    latin_name: 'Ixodes ricinus',
    category: 'Dangerous',
    danger_level: 8,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'High',
    pet_child_explanation: 'Principal European vector for Lyme borreliosis and Tick-Borne Encephalitis (TBE).',
    regions: ['UK', 'EU'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active primarily from spring through autumn, with questing activity closely linked to local ambient temperature and humidity.',
    habitat: 'Deciduous and coniferous woodlands, bracken, pastures, and rural heathlands.',
    description: 'Hard-bodied tick widely distributed across Europe and the British Isles. It attaches to mammalian hosts to take blood meals and is the primary vector for Lyme borreliosis and Tick-Borne Encephalitis in Europe.',
    first_aid: 'Use fine-tipped tweezers or a tick removal hook at skin level. Pull steadily without twisting or crushing the body. Disinfect area with antiseptic.',
    when_to_call_emergency: 'Consult a physician promptly if an expanding rash (such as Erythema migrans), fever, flu-like symptoms, or neurological signs emerge in the days or weeks following a tick bite.',
    photo_url: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Hedgehog Tick (Ixodes hexagonus)', 'Deer Tick (Ixodes scapularis)'],
    fun_fact: 'Castor bean ticks spend the vast majority of their multi-year lifecycle in vegetation and soil leaf litter, actively questing when humidity and temperatures allow.',
    conservation_status: 'Not evaluated',
    legal_protection_status: 'Not protected.',
    country_top_ten: [
      { country: 'UK', rank: 1, danger_summary: 'Primary UK vector for Lyme borreliosis in rural parks and Scottish Highlands.' },
      { country: 'EU', rank: 1, danger_summary: 'Primary vector for Lyme disease and Tick-Borne Encephalitis (TBE).' }
    ]
  },
  {
    id: 'latrodectus-hasselti',
    common_name: 'Redback Spider',
    latin_name: 'Latrodectus hasselti',
    category: 'Venomous',
    danger_level: 9,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'High',
    pet_child_explanation: 'Possesses alpha-latrotoxin venom capable of causing intense systemic pain (latrodectism).',
    regions: ['AU'],
    active_seasons: ['Summer', 'Autumn', 'Spring'],
    active_season_details: 'Year-round in warm climates; activity increases during warmer summer and autumn months.',
    habitat: 'Dry sheltered spots around human dwellings, outdoor furniture, mailboxes, and under plant pots.',
    description: 'Prominent Australian spider with a spherical black body featuring an unmistakable vibrant red or orange longitudinal stripe on the upper abdomen.',
    first_aid: 'Apply an ice pack to relieve intense localized pain. Do not use pressure immobilization (venom acts slowly). Keep calm and transport to medical care.',
    when_to_call_emergency: 'Seek immediate hospital emergency treatment for severe progressive pain, profuse sweating, muscular spasms, or if a child is bitten.',
    photo_url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Cupboard Spider (Steatoda)', 'Black House Spider (Badumna insignis)'],
    fun_fact: 'Female Redback spiders are substantially larger than males and frequently consume the male during mating.',
    conservation_status: 'Not evaluated',
    legal_protection_status: 'Not protected.',
    country_top_ten: [
      { country: 'AU', rank: 2, danger_summary: 'Common suburban venomous spider causing intense systemic latrodectism.' }
    ]
  },
  {
    id: 'latrodectus-hesperus',
    common_name: 'Western Black Widow Spider',
    latin_name: 'Latrodectus hesperus',
    category: 'Venomous',
    danger_level: 9,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'High',
    pet_child_explanation: 'Neurotoxic alpha-latrotoxin venom causing muscle rigidity, severe pain, and hypertension.',
    regions: ['US', 'CA'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active primarily during warmer months from spring through autumn, seeking sheltered microhabitats during cooler periods.',
    habitat: 'Garages, sheds, woodpiles, rodent burrows, and meter boxes.',
    description: 'Glossy black cobweb spider characterized by a distinctive red hourglass marking on the underside of the rounded abdomen.',
    first_aid: 'Clean bite site with soap and water. Apply ice packs wrapped in a cloth. Elevate bitten extremity and seek prompt medical care.',
    when_to_call_emergency: 'Seek emergency department evaluation if experiencing spreading pain, abdominal cramping, nausea, or sweating.',
    photo_url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['False Black Widow (Steatoda grossa)', 'Brown Widow (Latrodectus geometricus)'],
    fun_fact: 'The silk produced by black widow webs is known for having exceptional tensile strength compared to many other spider silks.',
    conservation_status: 'Least Concern',
    legal_protection_status: 'Not protected.',
    country_top_ten: [
      { country: 'US', rank: 3, danger_summary: 'Neurotoxic alpha-latrotoxin causing severe muscle rigidity.' },
      { country: 'CA', rank: 3, danger_summary: 'Rare but present in southern Ontario and Okanagan.' }
    ]
  },
  {
    id: 'solenopsis-invicta',
    common_name: 'Red Imported Fire Ant',
    latin_name: 'Solenopsis invicta',
    category: 'Dangerous',
    danger_level: 7,
    can_sting: true,
    can_bite: true,
    stinger_type: 'smooth',
    can_sting_repeatedly: true,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'High',
    pet_child_explanation: 'Aggressive mass stinging delivers solenopsin alkaloid venom forming itchy sterile pustules.',
    regions: ['US', 'AU'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active throughout warmer months; colonies remain active year-round in subtropical climates.',
    habitat: 'Open sunny pastures, lawns, golf courses, agricultural fields, and electrical utility boxes.',
    description: 'Aggressive reddish-brown ants that construct large dome-shaped earthen mounds. When disturbed, hundreds swarm and sting synchronously, injecting solenopsin alkaloid venom.',
    first_aid: 'Brush ants off vigorously. Wash area with soap. Apply topical hydrocortisone or oral antihistamines to reduce the forming sterile pustules.',
    when_to_call_emergency: 'Call 911 immediately if victim experiences chest tightness, wheezing, hives, or swelling around mouth/throat (anaphylaxis).',
    photo_url: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Native Harvester Ant (Pogonomyrmex)', 'Carpenter Ant (Camponotus)'],
    fun_fact: 'Fire ants can bind together during flash floods to form a living waterproof floating raft with their queen safely inside.',
    conservation_status: 'Invasive pest species',
    legal_protection_status: 'Invasive biosecurity quarantine species subject to containment regulations.',
    country_top_ten: [
      { country: 'US', rank: 4, danger_summary: 'Red Imported Fire Ants can cause widespread painful stings and envenomation reactions in areas where established colonies occur, particularly across parts of the southern United States.' },
      { country: 'AU', rank: 4, danger_summary: 'High biosecurity priority eradication target in Queensland.' }
    ]
  },
  {
    id: 'tabanus-bovinus',
    common_name: 'Horsefly (Cleg)',
    latin_name: 'Tabanidae sp.',
    category: 'Dangerous',
    danger_level: 6,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'Moderate',
    pet_child_explanation: 'Delivers painful cutting bites with potential for secondary bacterial wound infection.',
    regions: ['UK', 'EU', 'US', 'CA'],
    active_seasons: ['Summer'],
    active_season_details: 'Generally active during summer and warm periods, particularly on warm, still days near water or livestock.',
    habitat: 'Damp woodlands, horse stables, lakesides, pastures, and marshlands.',
    description: 'Large, stout-bodied fly with large iridescent eyes. Females have scissor-like mouthparts that slice skin open to pool and drink blood.',
    first_aid: 'Wash the bleeding bite thoroughly with antiseptic wash. Apply cold compress and antihistamine cream to alleviate pain and prominent swelling.',
    when_to_call_emergency: 'Seek medical care if the wound becomes hot, excessively swollen, streaks red (cellulitis), or if allergic symptoms develop.',
    photo_url: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Deer Fly (Chrysops)', 'Robber Fly (Asilidae)'],
    fun_fact: 'Horseflies are attracted to dark moving objects, heat signatures, and carbon dioxide exhaled by mammals.',
    conservation_status: 'Least Concern',
    legal_protection_status: 'Not protected.',
    country_top_ten: [
      { country: 'UK', rank: 3, danger_summary: 'Causes painful slicing bites frequently complicated by secondary bacterial infections.' },
      { country: 'CA', rank: 4, danger_summary: 'Aggressive biters near Canadian shield lakes.' },
      { country: 'EU', rank: 9, danger_summary: 'Painful blood-sucking bite near livestock and water.' }
    ]
  },
  {
    id: 'aedes-albopictus',
    common_name: 'Asian Tiger Mosquito',
    latin_name: 'Aedes albopictus',
    category: 'Dangerous',
    danger_level: 8,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'High',
    pet_child_explanation: 'Daytime biter capable of transmitting Dengue, Chikungunya, and Zika viruses.',
    regions: ['US', 'EU', 'AU'],
    active_seasons: ['Summer', 'Autumn'],
    active_season_details: 'Active across warmer months from late spring through autumn, with seasonal timing depending on local temperatures and rainfall.',
    habitat: 'Urban backyards, flower pot saucers, bird baths, clogged rain gutters, discarded tires.',
    description: 'Distinctive black mosquito with bold white stripes on its body and banded legs. Aggressive daytime biter known as a competent vector for Dengue, Chikungunya, and Zika viruses.',
    first_aid: 'Wash bite with soap and water. Apply calamine lotion or ice pack to soothe itching. Avoid scratching.',
    when_to_call_emergency: 'Consult a healthcare professional if high fever, severe joint or muscle pain, or unexpected rash develop following mosquito exposure in areas with active viral transmission.',
    photo_url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Yellow Fever Mosquito (Aedes aegypti)', 'Common House Mosquito (Culex pipiens)'],
    fun_fact: 'Female Asian Tiger mosquitoes can successfully lay eggs in very small amounts of standing water, including plant saucers, discarded containers, clogged gutters, and tree hollows.',
    conservation_status: 'Invasive species of public health concern',
    legal_protection_status: 'Invasive vector species monitored under municipal vector control programmes.',
    country_top_ten: [
      { country: 'US', rank: 3, danger_summary: 'Major urban disease vector spreading northward due to warming climate.' },
      { country: 'EU', rank: 2, danger_summary: 'Responsible for localized Dengue and Chikungunya outbreaks in Southern and Western Europe.' }
    ]
  },
  {
    id: 'lucanus-cervus',
    common_name: 'Stag Beetle',
    latin_name: 'Lucanus cervus',
    category: 'Protected',
    danger_level: 1,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Low',
    pet_child_explanation: 'Poses minimal risk to children and pets. Mandibles are adapted for wrestling and rarely breach human skin.',
    regions: ['UK', 'EU'],
    active_seasons: ['Summer'],
    active_season_details: 'Adults are active during late spring and early summer, particularly on warm, still evenings.',
    habitat: 'Ancient oak woodlands, suburban gardens with rotting tree stumps, and parks.',
    description: 'One of the largest terrestrial beetles in Europe and the United Kingdom. Males possess magnificent antler-like mandibles used for wrestling rival males over mates.',
    first_aid: 'Bite from male mandibles is very weak; female can deliver a brief pinch. Wash skin if pinched.',
    when_to_call_emergency: 'None.',
    photo_url: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Lesser Stag Beetle (Dorcus parallelipipedus)'],
    fun_fact: 'Stag beetle larvae develop underground for multiple years, feeding on decaying subterranean hardwood before emerging as adults for the summer breeding season.',
    conservation_status: 'Near Threatened (IUCN Red List)',
    legal_protection_status: 'Protected under Annex II of the EU Habitats Directive and Schedule 5 of the UK Wildlife and Countryside Act 1981.',
    country_top_ten: []
  },
  {
    id: 'polistes-dominula',
    common_name: 'European Paper Wasp',
    latin_name: 'Polistes dominula',
    category: 'Dangerous',
    danger_level: 5,
    can_sting: true,
    can_bite: true,
    stinger_type: 'smooth',
    can_sting_repeatedly: true,
    dangerous_to_children: true,
    dangerous_to_pets: true,
    pet_child_hazard: 'Moderate',
    pet_child_explanation: 'Defends small umbrella-like open nests under eaves and tiles. Stings repeatedly if nest is disturbed.',
    regions: ['EU', 'US', 'CA', 'UK'],
    active_seasons: ['Spring', 'Summer', 'Autumn'],
    active_season_details: 'Active from spring through autumn as temperatures rise, with colony founding occurring in early spring.',
    habitat: 'Residential roof eaves, window frames, sheds, and sheltered vegetation.',
    description: 'Slender black-and-yellow paper wasp with distinctly orange antennae and long trailing hind legs in flight. Builds open comb nests without an outer paper envelope.',
    first_aid: 'Wash sting site with soap and water. Apply cold packs to reduce localized swelling.',
    when_to_call_emergency: 'Call emergency services if stung in airway or signs of systemic allergy appear.',
    photo_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Common Yellowjacket (Vespula vulgaris)', 'German Wasp (Vespula germanica)'],
    fun_fact: 'Paper wasps build their nests from chewed wood fibers mixed with saliva, producing a lightweight, water-resistant papery material.',
    conservation_status: 'Least Concern',
    legal_protection_status: 'Not protected.',
    country_top_ten: [
      { country: 'CA', rank: 10, danger_summary: 'Invasive wasp nesting under residential roof eaves.' }
    ]
  },
  {
    id: 'steatoda-nobilis',
    common_name: 'Noble False Black Widow',
    latin_name: 'Steatoda nobilis',
    category: 'Dangerous',
    danger_level: 5,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Moderate',
    pet_child_explanation: 'Delivers a localized venomous bite comparable to a wasp sting. Not life-threatening to healthy individuals.',
    regions: ['UK', 'EU', 'US'],
    active_seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
    active_season_details: 'Year-round in sheltered indoor or wall cavity microclimates; outdoor activity peaks in warm weather.',
    habitat: 'External house walls, conservatories, sheds, and window frames.',
    description: 'Medium-sized cobweb spider with a shiny globular abdomen marked with cream-colored skull-like patterns and reddish-brown legs. Non-aggressive, biting only when pressed against skin.',
    first_aid: 'Wash bite area with soap and water. Apply a cold compress. Take an over-the-counter pain reliever if throbbing occurs.',
    when_to_call_emergency: 'Consult medical services if swelling expands significantly or secondary bacterial infection occurs.',
    photo_url: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['True Black Widow (Latrodectus)', 'Missing Sector Orb Weaver (Zygiella x-notata)'],
    fun_fact: 'Despite sensationalist headlines, Noble False Widow bites typically produce symptoms similar to a minor wasp sting with localized swelling and discomfort.',
    conservation_status: 'Least Concern',
    legal_protection_status: 'Not protected.',
    country_top_ten: [
      { country: 'UK', rank: 5, danger_summary: 'Mildly cytotoxic bite resembling a painful wasp sting.' }
    ]
  },
  {
    id: 'cimex-lectularius',
    common_name: 'Common Bed Bug',
    latin_name: 'Cimex lectularius',
    category: 'Pest',
    danger_level: 4,
    can_sting: false,
    can_bite: true,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Low',
    pet_child_explanation: 'Non-venomous and does not transmit disease pathogens, but causes itchy welts and psychological distress.',
    regions: ['UK', 'EU', 'US', 'CA', 'AU'],
    active_seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
    active_season_details: 'Active year-round in temperature-controlled indoor habitats.',
    habitat: 'Bed mattress seams, headboards, baseboards, electrical outlet plates, and furniture crevices.',
    description: 'Small, oval, dorsoventrally flattened reddish-brown parasitic insect that feeds exclusively on blood from sleeping humans and animals.',
    first_aid: 'Wash bite sites with soap and water. Apply calamine lotion or mild topical hydrocortisone to relieve itching.',
    when_to_call_emergency: 'None unless secondary bacterial skin infections develop from heavy scratching.',
    photo_url: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Bat Bug (Cimex adjunctus)', 'Carpet Beetle Larva (Anthrenus)'],
    fun_fact: 'Bed bugs inject an anesthetic and anticoagulant in their saliva, allowing them to feed on host blood unnoticed for several minutes.',
    conservation_status: 'Not evaluated',
    legal_protection_status: 'Not protected; household public health pest.',
    country_top_ten: [
      { country: 'UK', rank: 9, danger_summary: 'Severe allergic skin welts and sleep disruption.' },
      { country: 'CA', rank: 7, danger_summary: 'Widespread metropolitan pest problem.' }
    ]
  },
  {
    id: 'blattella-germanica',
    common_name: 'German Cockroach',
    latin_name: 'Blattella germanica',
    category: 'Pest',
    danger_level: 4,
    can_sting: false,
    can_bite: false,
    stinger_type: 'none',
    can_sting_repeatedly: false,
    dangerous_to_children: false,
    dangerous_to_pets: false,
    pet_child_hazard: 'Moderate',
    pet_child_explanation: 'Shed skins and droppings are potent allergen and asthma triggers for children and sensitive individuals.',
    regions: ['UK', 'EU', 'US', 'CA', 'AU'],
    active_seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
    active_season_details: 'Active year-round in heated indoor environments, especially kitchens and bathrooms.',
    habitat: 'Kitchen cabinets, behind refrigerators, under sinks, pipe chases, and warm motor housings.',
    description: 'Small, light brown to tan cockroach with two prominent dark parallel stripes running down its pronotum. Prolific indoor structural pest.',
    first_aid: 'Non-venomous and non-stinging. Wash surfaces with disinfectant detergent.',
    when_to_call_emergency: 'Seek medical care if severe asthma attacks are triggered by indoor allergen exposure.',
    photo_url: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=800&q=80',
    look_alikes: ['Asian Cockroach (Blattella asahinai)', 'Brown-banded Cockroach (Supella longipalpa)'],
    fun_fact: 'A female German cockroach carries her egg capsule (ootheca) attached to her body until just hours before the nymphs emerge.',
    conservation_status: 'Not evaluated',
    legal_protection_status: 'Not protected; major urban hygiene pest.',
    country_top_ten: [
      { country: 'UK', rank: 10, danger_summary: 'Major household allergen trigger and disease carrier.' }
    ]
  }
];

export const TOP_TEN_BY_COUNTRY: Record<string, { rank: number; name: string; latin: string; danger: string; level: number }[]> = {
  UK: [
    { rank: 1, name: 'Castor Bean Tick (Sheep Tick)', latin: 'Ixodes ricinus', danger: 'Primary UK vector for Lyme borreliosis in rural parks and Scottish Highlands.', level: 8 },
    { rank: 2, name: 'Asian Hornet', latin: 'Vespa velutina', danger: 'Invasive predator with intense envenomation risk.', level: 8 },
    { rank: 3, name: 'Horsefly (Cleg)', latin: 'Tabanidae', danger: 'Slices flesh with scissor mandibles, high bacterial infection risk.', level: 6 },
    { rank: 4, name: 'Common Yellowjacket Wasp', latin: 'Vespula vulgaris', danger: 'Multiple aggressive stings, common source of anaphylaxis.', level: 7 },
    { rank: 5, name: 'False Widow Spider', latin: 'Steatoda nobilis', danger: 'Mildly cytotoxic bite resembling a painful wasp sting.', level: 5 },
    { rank: 6, name: 'European Hornet', latin: 'Vespa crabro', danger: 'Deep venomous sting, defensive of nest cavities.', level: 6 },
    { rank: 7, name: 'Oak Processionary Moth (Caterpillar)', latin: 'Thaumetopoea processionea', danger: 'Microscopic barbed hairs cause severe skin/respiratory reactions.', level: 7 },
    { rank: 8, name: 'Biting Midge (Highland Midge)', latin: 'Culicoides impunctatus', danger: 'Relentless swarming biters causing acute dermatitis.', level: 4 },
    { rank: 9, name: 'Bed Bug', latin: 'Cimex lectularius', danger: 'Severe allergic skin welts and sleep disruption.', level: 5 },
    { rank: 10, name: 'German Cockroach', latin: 'Blattella germanica', danger: 'Major household allergen trigger and disease carrier.', level: 5 }
  ],
  US: [
    { rank: 1, name: 'Deer Tick (Blacklegged Tick)', latin: 'Ixodes scapularis', danger: 'Vector for Lyme disease, Anaplasmosis, and Powassan.', level: 8 },
    { rank: 2, name: 'Brown Recluse Spider', latin: 'Loxosceles reclusa', danger: 'Potent cytotoxic venom causing necrotic tissue breakdown.', level: 9 },
    { rank: 3, name: 'Western Black Widow Spider', latin: 'Latrodectus hesperus', danger: 'Neurotoxic alpha-latrotoxin causing severe muscle rigidity.', level: 9 },
    { rank: 4, name: 'Red Imported Fire Ant', latin: 'Solenopsis invicta', danger: 'Swarming mass stings causing pustules and anaphylaxis.', level: 7 },
    { rank: 5, name: 'Asian Tiger Mosquito', latin: 'Aedes albopictus', danger: 'Competent vector for Dengue, West Nile, and Zika.', level: 8 },
    { rank: 6, name: 'Africanized Honey Bee', latin: 'Apis mellifera scutellata', danger: 'Hyper-defensive "killer bees" pursuing victims for hundreds of yards.', level: 8 },
    { rank: 7, name: 'Striped Bark Scorpion', latin: 'Centruroides vittatus', danger: 'Neurotoxic stings in southwest/southern states.', level: 7 },
    { rank: 8, name: 'Puss Caterpillar (Southern Flannel Moth)', latin: 'Megalopyge opercularis', danger: 'Venomous spines cause agonizing bone-deep burning pain.', level: 8 },
    { rank: 9, name: 'Bald-faced Hornet', latin: 'Dolichovespula maculata', danger: 'Aggressive nest defender with smooth repeat stinger.', level: 7 },
    { rank: 10, name: 'Kissing Bug (Triatominae)', latin: 'Triatoma sp.', danger: 'Vector for Chagas disease parasite in southern regions.', level: 7 }
  ],
  AU: [
    { rank: 1, name: 'Sydney Funnel-Web Spider', latin: 'Atrax robustus', danger: 'World’s most dangerous spider; lethal without antivenom.', level: 10 },
    { rank: 2, name: 'Redback Spider', latin: 'Latrodectus hasselti', danger: 'Common suburban venomous spider causing intense systemic latrodectism.', level: 9 },
    { rank: 3, name: 'Bull Ant (Myrmecia)', latin: 'Myrmecia gulosa', danger: 'Largest ants on Earth; jumps and stings with allergenic venom.', level: 8 },
    { rank: 4, name: 'Australian Paralysis Tick', latin: 'Ixodes holocyclus', danger: 'Secretes holocyclotoxin causing ascending motor paralysis.', level: 9 },
    { rank: 5, name: 'Mouse Spider', latin: 'Missulena sp.', danger: 'Deep venomous bite comparable to Funnel-webs.', level: 8 },
    { rank: 6, name: 'Red Imported Fire Ant', latin: 'Solenopsis invicta', danger: 'Invasive agricultural and health biosecurity hazard.', level: 7 },
    { rank: 7, name: 'Paper Wasp', latin: 'Polistes sp.', danger: 'Defensive suburban stinging wasps.', level: 6 },
    { rank: 8, name: 'March Fly (Australian Tabanid)', latin: 'Tabanidae', danger: 'Painful slicing bite with prolonged bleeding.', level: 5 },
    { rank: 9, name: 'Centipede (Giant Centipede)', latin: 'Ethmostigmus rubripes', danger: 'Painful venomous forcipules causing burning swelling.', level: 7 },
    { rank: 10, name: 'White-tailed Spider', latin: 'Lampona cylindrata', danger: 'Painful localized bite often causing secondary irritation.', level: 5 }
  ],
  CA: [
    { rank: 1, name: 'Blacklegged Tick', latin: 'Ixodes scapularis', danger: 'Spreading Lyme disease across Ontario, Quebec, and Maritimes.', level: 8 },
    { rank: 2, name: 'Yellowjacket Wasp', latin: 'Vespula vulgaris', danger: 'Ground-dwelling late summer stinging menace.', level: 7 },
    { rank: 3, name: 'Northern Black Widow Spider', latin: 'Latrodectus variolus', danger: 'Rare but present in southern Ontario and Okanagan.', level: 8 },
    { rank: 4, name: 'Horsefly & Deerfly', latin: 'Tabanidae', danger: 'Aggressive biters near Canadian shield lakes.', level: 6 },
    { rank: 5, name: 'Black Flies (Simuliidae)', latin: 'Simulium sp.', danger: 'Massive swarms in northern boreal forests causing blood loss.', level: 5 },
    { rank: 6, name: 'Bald-faced Hornet', latin: 'Dolichovespula maculata', danger: 'Large aerial paper nests with defensive stinging.', level: 7 },
    { rank: 7, name: 'Bed Bug', latin: 'Cimex lectularius', danger: 'Widespread metropolitan pest problem.', level: 5 },
    { rank: 8, name: 'Bumblebee', latin: 'Bombus sp.', danger: 'Docile pollinator, but stings if crushed or nest disturbed.', level: 3 },
    { rank: 9, name: 'Mosquito (Culex tarsalis)', latin: 'Culex tarsalis', danger: 'Vector for West Nile Virus across the Prairies.', level: 6 },
    { rank: 10, name: 'European Paper Wasp', latin: 'Polistes dominula', danger: 'Invasive wasp nesting under residential roof eaves.', level: 5 }
  ],
  EU: [
    { rank: 1, name: 'Castor Bean Tick (Sheep Tick)', latin: 'Ixodes ricinus', danger: 'Primary vector for Lyme disease and Tick-Borne Encephalitis (TBE).', level: 8 },
    { rank: 2, name: 'Asian Tiger Mosquito', latin: 'Aedes albopictus', danger: 'Dengue and Chikungunya transmission in Mediterranean and Western Europe.', level: 8 },
    { rank: 3, name: 'Asian Hornet', latin: 'Vespa velutina', danger: 'Invasive species responsible for severe anaphylactic emergencies.', level: 8 },
    { rank: 4, name: 'European Hornet', latin: 'Vespa crabro', danger: 'Potent sting with acetylcholine neurotransmitter component.', level: 6 },
    { rank: 5, name: 'European Black Widow (Mediterranean Widow)', latin: 'Latrodectus tredecimguttatus', danger: 'Venomous spider with 13 red spots found in Southern Europe.', level: 8 },
    { rank: 6, name: 'Pine Processionary Caterpillar', latin: 'Thaumetopoea pityocampa', danger: 'Extremely dangerous urticating hairs causing necrosis in dogs and humans.', level: 8 },
    { rank: 7, name: 'European Yellowjacket', latin: 'Vespula germanica', danger: 'Aggressive picnic scavenger and nest defender.', level: 7 },
    { rank: 8, name: 'Mediterranean Recluse Spider', latin: 'Loxosceles rufescens', danger: 'Cytotoxic bite with necrotic potential in Mediterranean basin.', level: 7 },
    { rank: 9, name: 'Horsefly (Tabanus)', latin: 'Tabanus bovinus', danger: 'Painful blood-sucking bite near livestock and water.', level: 6 },
    { rank: 10, name: 'Yellow-tailed Scorpion', latin: 'Tetratrichobothrius flavicaudis', danger: 'Mildly venomous scorpion found in Southern Europe and UK docks.', level: 5 }
  ]
};

/**
 * UNIFIED SOURCE OF TRUTH MATCHER
 * Accurately matches any identified specimen's scientific or common name to the curated encyclopedia entry.
 */
export function findCuratedSpecies(latinName?: string, commonName?: string): SpeciesEntry | null {
  if (!latinName && !commonName) return null;
  const lLatin = (latinName || '').toLowerCase().trim();
  const lCommon = (commonName || '').toLowerCase().trim();

  // 1. Direct ID / Exact match
  for (const sp of ENCYCLOPEDIA_SPECIES) {
    if (
      lLatin === sp.latin_name.toLowerCase() ||
      lCommon === sp.common_name.toLowerCase() ||
      lLatin === sp.id.toLowerCase()
    ) {
      return sp;
    }
  }

  // 2. Specialized Taxonomic Group / Species Matching
  if (lLatin.includes('vespa crabro') || lCommon.includes('european hornet')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'vespa-crabro') || null;
  }
  if (lLatin.includes('vespa velutina') || lCommon.includes('asian hornet') || lCommon.includes('yellow-legged hornet')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'vespa-velutina') || null;
  }
  if (lLatin.includes('apis mellifera') || (lCommon.includes('honey') && lCommon.includes('bee'))) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'apis-mellifera') || null;
  }
  if (lLatin.includes('bombus') || lCommon.includes('bumblebee') || lCommon.includes('bumble bee')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'bombus-spp') || null;
  }
  if (lLatin.includes('syrph') || lCommon.includes('hoverfly') || lCommon.includes('hover fly') || lCommon.includes('flower fly')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'syrphidae') || null;
  }
  if (lLatin.includes('coccinella septempunctata') || lCommon.includes('seven-spotted') || (lCommon.includes('ladybird') && !lCommon.includes('harlequin')) || (lCommon.includes('ladybug') && !lCommon.includes('harlequin'))) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'coccinella-septempunctata') || null;
  }
  if (lLatin.includes('vespula') || lLatin.includes('dolichovespula') || lCommon.includes('yellowjacket') || lCommon.includes('common wasp')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'vespula-vulgaris') || null;
  }
  if (lLatin.includes('lucanus cervus') || lCommon.includes('stag beetle')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'lucanus-cervus') || null;
  }
  if (lLatin.includes('atrax robustus') || lCommon.includes('funnel-web') || lCommon.includes('funnel web')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'atrox-robustus') || null;
  }
  if (lLatin.includes('loxosceles reclusa') || lCommon.includes('brown recluse')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'loxosceles-reclusa') || null;
  }
  if (lLatin.includes('ixodes scapularis') || lCommon.includes('deer tick') || lCommon.includes('blacklegged tick')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'ixodes-scapularis') || null;
  }
  if (lLatin.includes('ixodes ricinus') || lCommon.includes('castor bean tick') || lCommon.includes('sheep tick')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'ixodes-ricinus') || null;
  }
  if (lLatin.includes('latrodectus hasselti') || lCommon.includes('redback')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'latrodectus-hasselti') || null;
  }
  if (lLatin.includes('latrodectus hesperus') || lCommon.includes('black widow')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'latrodectus-hesperus') || null;
  }
  if (lLatin.includes('solenopsis invicta') || lCommon.includes('fire ant')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'solenopsis-invicta') || null;
  }
  if (lLatin.includes('taban') || lCommon.includes('horsefly') || lCommon.includes('cleg')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'tabanus-bovinus') || null;
  }
  if (lLatin.includes('aedes albopictus') || lCommon.includes('tiger mosquito')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'aedes-albopictus') || null;
  }
  if (lLatin.includes('polistes') || lCommon.includes('paper wasp')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'polistes-dominula') || null;
  }
  if (lLatin.includes('steatoda nobilis') || lCommon.includes('false widow')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'steatoda-nobilis') || null;
  }
  if (lLatin.includes('cimex') || lCommon.includes('bed bug')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'cimex-lectularius') || null;
  }
  if (lLatin.includes('blattella') || lCommon.includes('cockroach')) {
    return ENCYCLOPEDIA_SPECIES.find(s => s.id === 'blattella-germanica') || null;
  }

  return null;
}

