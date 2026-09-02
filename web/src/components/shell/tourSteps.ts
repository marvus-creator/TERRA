export interface TourStep {
  route: string | ((firstFarmId: string | null) => string)
  target: string
  title: string
  body: string
}

export const TOUR_STEPS: TourStep[] = [
  { route: '/', target: 'hero', title: 'Credit, seen from orbit', body: 'TERRA turns two years of Sentinel-2 imagery into a credit score a bank can lend against. No paperwork — the field is the paperwork.' },
  { route: '/', target: 'counters', title: 'Live from the engine', body: 'These numbers come straight from the Python engine: farms registered, hectares watched, and every cloud-masked satellite scene analysed.' },
  { route: '/', target: 'components', title: 'Three ingredients', body: 'Every score is 50% productivity, 30% consistency and 20% trend. Nothing hidden, nothing learned from a black box.' },
  { route: '/farms', target: 'farm-grid', title: 'The portfolio', body: 'Each card carries a mini NDVI sparkline, the score band, and the seasons the satellite has already seen. Search, filter and sort live.' },
  { route: id => (id ? `/farms/${id}` : '/farms'), target: 'gauge', title: 'The TERRA Score', body: 'A 300–850 score, animated onto the NDVI ramp, with a plain-language verdict for the loan officer.' },
  { route: id => (id ? `/farms/${id}` : '/farms'), target: 'story', title: 'Score Story', body: 'Press play: the exact arithmetic that produced this farm’s score, one step at a time, using its own season peaks.' },
  { route: id => (id ? `/farms/${id}` : '/farms'), target: 'chart', title: 'Field health over time', body: 'Season A and B are shaded, hollow dots are partly cloud-masked scenes, and the scrubber walks through every satellite pass.' },
  { route: '/map', target: 'overlay-panel', title: 'Live crop-health map', body: 'The latest clear Sentinel-2 scene rendered as an NDVI overlay. Hover a farm card to light up its field.' },
  { route: '/lenders', target: 'lender-table', title: 'Lender view', body: 'Sort the portfolio by score, hectares or trend, then pick two or three farms to compare side by side.' },
  { route: '/register', target: 'register-steps', title: 'Register in three steps', body: 'Details, draw the field on satellite imagery, confirm. From then on, the satellite is watching.' },
  { route: '/how-it-works', target: 'formula', title: 'The exact formula', body: 'Every weight and threshold, written out so a loan committee can check it in one minute.' },
]
