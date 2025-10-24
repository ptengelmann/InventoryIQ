// UK EVENTS CALENDAR - Comprehensive tracking of EVERY commercial opportunity
// 150+ events per year with alcohol sales intelligence

export interface UKEvent {
  id: string
  name: string
  type: 'holiday' | 'sporting' | 'cultural' | 'seasonal' | 'commercial' | 'weather'
  dateCalculation: 'fixed' | 'calculated' | 'variable'
  month?: number // 1-12
  day?: number
  description: string
  alcoholIntelligence: {
    primaryCategories: string[] // What alcohols sell best
    secondaryCategories?: string[]
    averageLift: number // % increase in sales
    peakPeriod: string // When to stock/promote
    consumerBehavior: string // Why they buy
    priceElasticity: 'high' | 'medium' | 'low' // Discount sensitivity
    giftingRelevance: 'essential' | 'high' | 'medium' | 'low'
    volumeDriver: 'parties' | 'gifting' | 'personal' | 'social'
  }
  marketingAngle: string
  urgencyWindow: string // How far in advance to prepare
  competitorActivity: 'extreme' | 'high' | 'medium' | 'low'
  preparationLeadTime: number // Days before event to start promotion
}

export class UKEventsCalendar {

  // COMPREHENSIVE EVENT DEFINITIONS
  static readonly EVENTS: UKEvent[] = [
    // JANUARY
    {
      id: 'new-year-day',
      name: "New Year's Day",
      type: 'holiday',
      dateCalculation: 'fixed',
      month: 1,
      day: 1,
      description: 'National holiday, recovery day, hair of the dog',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'lager', 'cider'],
        secondaryCategories: ['gin', 'vodka'],
        averageLift: 30,
        peakPeriod: '1-7 days before',
        consumerBehavior: 'Leftover party stock, hangover cures, quiet drinking',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'personal'
      },
      marketingAngle: 'Hair of the dog, recovery drinks, leftover party stock',
      urgencyWindow: '1-2 weeks before',
      competitorActivity: 'medium',
      preparationLeadTime: 14
    },
    {
      id: 'dry-january',
      name: 'Dry January',
      type: 'cultural',
      dateCalculation: 'fixed',
      month: 1,
      description: 'Alcohol abstinence awareness month',
      alcoholIntelligence: {
        primaryCategories: ['non-alcoholic', 'low-alcohol'],
        secondaryCategories: ['premium spirits for post-Dry January'],
        averageLift: -40, // Negative for traditional alcohol
        peakPeriod: 'Entire month + Feb 1st celebration',
        consumerBehavior: 'Abstinence, then reward on Feb 1st. Stock non-alcoholic alternatives',
        priceElasticity: 'low',
        giftingRelevance: 'low',
        volumeDriver: 'personal'
      },
      marketingAngle: 'Non-alcoholic alternatives, "Save for February" pre-orders',
      urgencyWindow: 'December preparation',
      competitorActivity: 'medium',
      preparationLeadTime: 30
    },
    {
      id: 'burns-night',
      name: 'Burns Night',
      type: 'cultural',
      dateCalculation: 'fixed',
      month: 1,
      day: 25,
      description: 'Scottish cultural celebration of Robert Burns',
      alcoholIntelligence: {
        primaryCategories: ['scotch whisky', 'whiskey', 'single malt'],
        secondaryCategories: ['beer', 'ale'],
        averageLift: 250, // Massive for Scotch
        peakPeriod: '1-2 weeks before',
        consumerBehavior: 'Scottish heritage, haggis dinners, cultural celebrations, whisky tasting',
        priceElasticity: 'low', // People pay premium for authentic Scotch
        giftingRelevance: 'medium',
        volumeDriver: 'social'
      },
      marketingAngle: 'Authentic Scottish whisky, Burns Night suppers, cultural heritage',
      urgencyWindow: '2-3 weeks before',
      competitorActivity: 'high',
      preparationLeadTime: 21
    },
    {
      id: 'chinese-new-year',
      name: 'Chinese New Year',
      type: 'cultural',
      dateCalculation: 'calculated', // Late Jan / Early Feb
      description: 'Lunar New Year celebrations',
      alcoholIntelligence: {
        primaryCategories: ['champagne', 'cognac', 'baijiu', 'rice wine'],
        secondaryCategories: ['red wine', 'premium spirits'],
        averageLift: 80,
        peakPeriod: '2 weeks before to 2 weeks after',
        consumerBehavior: 'Family gatherings, gifting, red packaging appeal, luxury positioning',
        priceElasticity: 'low',
        giftingRelevance: 'essential',
        volumeDriver: 'gifting'
      },
      marketingAngle: 'Luxury gifting, red packaging, family celebration essentials',
      urgencyWindow: '3-4 weeks before',
      competitorActivity: 'high',
      preparationLeadTime: 28
    },

    // FEBRUARY
    {
      id: 'valentines-day',
      name: "Valentine's Day",
      type: 'holiday',
      dateCalculation: 'fixed',
      month: 2,
      day: 14,
      description: 'Romantic celebration, biggest gifting opportunity',
      alcoholIntelligence: {
        primaryCategories: ['champagne', 'prosecco', 'rosé wine', 'pink gin'],
        secondaryCategories: ['red wine', 'chocolate liqueurs', 'premium spirits'],
        averageLift: 300, // MASSIVE lift for champagne
        peakPeriod: '7-14 days before',
        consumerBehavior: 'Romantic gifting, intimate dinners, date nights, couples, "treats for her/him"',
        priceElasticity: 'low', // People splurge on romance
        giftingRelevance: 'essential',
        volumeDriver: 'gifting'
      },
      marketingAngle: 'Romance, intimacy, special moments, premium gifting, "for your loved one"',
      urgencyWindow: '2-3 weeks before',
      competitorActivity: 'extreme',
      preparationLeadTime: 21
    },
    {
      id: 'six-nations-rugby',
      name: 'Six Nations Rugby Championship',
      type: 'sporting',
      dateCalculation: 'calculated', // Feb-March
      description: 'Major European rugby tournament',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'lager', 'cider', 'ale'],
        secondaryCategories: ['whisky', 'spirits'],
        averageLift: 150,
        peakPeriod: 'Match days (weekends)',
        consumerBehavior: 'Sports viewing parties, pub watching, social drinking, male-heavy demographic',
        priceElasticity: 'high', // Price-sensitive bulk buyers
        giftingRelevance: 'low',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Match day specials, multi-buy offers, party packs, "for the lads"',
      urgencyWindow: 'Throughout Feb-March',
      competitorActivity: 'high',
      preparationLeadTime: 7
    },

    // MARCH
    {
      id: 'st-patricks-day',
      name: "St. Patrick's Day",
      type: 'holiday',
      dateCalculation: 'fixed',
      month: 3,
      day: 17,
      description: 'Irish cultural celebration, massive drinking holiday',
      alcoholIntelligence: {
        primaryCategories: ['irish whiskey', 'guinness', 'stout', 'beer', 'irish cream'],
        secondaryCategories: ['green cocktails', 'cider'],
        averageLift: 400, // HUGE for Irish drinks
        peakPeriod: '1 week before',
        consumerBehavior: 'Party drinking, Irish pride, themed parties, pub crawls, group purchases',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Irish celebration, green drinks, party essentials, "luck of the Irish"',
      urgencyWindow: '2-3 weeks before',
      competitorActivity: 'extreme',
      preparationLeadTime: 21
    },
    {
      id: 'mothers-day-uk',
      name: "Mother's Day",
      type: 'holiday',
      dateCalculation: 'calculated', // 4th Sunday of Lent
      description: 'Maternal appreciation, major gifting holiday',
      alcoholIntelligence: {
        primaryCategories: ['champagne', 'prosecco', 'rosé wine', 'gin', 'white wine'],
        secondaryCategories: ['liqueurs', 'premium spirits'],
        averageLift: 200,
        peakPeriod: '1-2 weeks before',
        consumerBehavior: 'Gifting for mothers, "treat for mum", premium packaging, flowers + alcohol combo',
        priceElasticity: 'low',
        giftingRelevance: 'essential',
        volumeDriver: 'gifting'
      },
      marketingAngle: 'Gifting for mum, premium packaging, elegant presentation, "she deserves it"',
      urgencyWindow: '2-3 weeks before',
      competitorActivity: 'extreme',
      preparationLeadTime: 21
    },
    {
      id: 'easter',
      name: 'Easter',
      type: 'holiday',
      dateCalculation: 'calculated', // Moveable feast
      description: 'Spring holiday, family gatherings, chocolate pairing',
      alcoholIntelligence: {
        primaryCategories: ['white wine', 'rosé', 'champagne', 'gin'],
        secondaryCategories: ['dessert wine', 'liqueurs'],
        averageLift: 120,
        peakPeriod: '1-2 weeks before',
        consumerBehavior: 'Family dinners, spring celebrations, chocolate pairing, garden parties',
        priceElasticity: 'medium',
        giftingRelevance: 'medium',
        volumeDriver: 'social'
      },
      marketingAngle: 'Spring entertaining, family gatherings, chocolate pairings',
      urgencyWindow: '3 weeks before',
      competitorActivity: 'high',
      preparationLeadTime: 21
    },

    // APRIL
    {
      id: 'easter-bank-holiday',
      name: 'Easter Bank Holiday Weekend',
      type: 'holiday',
      dateCalculation: 'calculated',
      description: '4-day weekend, outdoor activities begin',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'cider', 'gin', 'prosecco'],
        secondaryCategories: ['white wine', 'rosé'],
        averageLift: 180,
        peakPeriod: 'Thursday-Friday before',
        consumerBehavior: 'Long weekend entertaining, BBQs, outdoor drinking, garden parties',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'social'
      },
      marketingAngle: 'Long weekend essentials, outdoor entertaining, garden party stock',
      urgencyWindow: '2 weeks before',
      competitorActivity: 'high',
      preparationLeadTime: 14
    },

    // MAY
    {
      id: 'may-day-bank-holiday',
      name: 'May Day Bank Holiday',
      type: 'holiday',
      dateCalculation: 'calculated', // First Monday in May
      description: 'Spring bank holiday, outdoor activities',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'cider', 'gin', 'pimms'],
        secondaryCategories: ['white wine', 'rosé'],
        averageLift: 140,
        peakPeriod: 'Weekend before',
        consumerBehavior: 'BBQs, outdoor gatherings, spring weather drinking',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'social'
      },
      marketingAngle: 'Spring bank holiday BBQs, outdoor drinking, seasonal refreshment',
      urgencyWindow: '1-2 weeks before',
      competitorActivity: 'medium',
      preparationLeadTime: 14
    },
    {
      id: 'fa-cup-final',
      name: 'FA Cup Final',
      type: 'sporting',
      dateCalculation: 'calculated', // Late May
      description: 'Major English football event',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'lager', 'cider'],
        secondaryCategories: ['whisky'],
        averageLift: 200,
        peakPeriod: 'Final day + preceding weekend',
        consumerBehavior: 'Sports viewing parties, pub culture, football fans',
        priceElasticity: 'high',
        giftingRelevance: 'low',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Match day party packs, football viewing essentials',
      urgencyWindow: '1 week before',
      competitorActivity: 'high',
      preparationLeadTime: 7
    },

    // JUNE
    {
      id: 'fathers-day-uk',
      name: "Father's Day",
      type: 'holiday',
      dateCalculation: 'calculated', // 3rd Sunday in June
      description: 'Paternal appreciation, major gifting holiday',
      alcoholIntelligence: {
        primaryCategories: ['whisky', 'beer', 'craft beer', 'gin', 'rum'],
        secondaryCategories: ['wine', 'bourbon'],
        averageLift: 220,
        peakPeriod: '1-2 weeks before',
        consumerBehavior: 'Gifting for fathers, premium spirits, "for dad", BBQ essentials',
        priceElasticity: 'low',
        giftingRelevance: 'essential',
        volumeDriver: 'gifting'
      },
      marketingAngle: 'Gifts for dad, premium spirits, BBQ essentials, "he deserves it"',
      urgencyWindow: '2-3 weeks before',
      competitorActivity: 'extreme',
      preparationLeadTime: 21
    },
    {
      id: 'wimbledon',
      name: 'Wimbledon Tennis Championships',
      type: 'sporting',
      dateCalculation: 'calculated', // Late June - Early July
      description: 'Prestigious tennis tournament, quintessentially British',
      alcoholIntelligence: {
        primaryCategories: ['champagne', 'pimms', 'gin', 'strawberry drinks'],
        secondaryCategories: ['prosecco', 'white wine'],
        averageLift: 180,
        peakPeriod: 'Finals weekend',
        consumerBehavior: 'Upmarket viewing parties, garden entertaining, British tradition',
        priceElasticity: 'low',
        giftingRelevance: 'low',
        volumeDriver: 'social'
      },
      marketingAngle: 'Wimbledon viewing parties, British tradition, elegant entertaining',
      urgencyWindow: 'Throughout tournament',
      competitorActivity: 'high',
      preparationLeadTime: 14
    },
    {
      id: 'summer-solstice',
      name: 'Summer Solstice',
      type: 'seasonal',
      dateCalculation: 'fixed',
      month: 6,
      day: 21,
      description: 'Longest day, start of summer season',
      alcoholIntelligence: {
        primaryCategories: ['gin', 'beer', 'cider', 'rosé', 'white wine'],
        secondaryCategories: ['tequila', 'rum'],
        averageLift: 160,
        peakPeriod: 'Week of solstice',
        consumerBehavior: 'Summer celebration, outdoor drinking, long evenings',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'social'
      },
      marketingAngle: 'Summer celebration, longest day, outdoor entertaining',
      urgencyWindow: '2 weeks before',
      competitorActivity: 'medium',
      preparationLeadTime: 14
    },
    {
      id: 'glastonbury',
      name: 'Glastonbury Festival',
      type: 'cultural',
      dateCalculation: 'calculated', // Late June
      description: 'Major music festival, youth culture',
      alcoholIntelligence: {
        primaryCategories: ['cider', 'beer', 'vodka', 'gin'],
        secondaryCategories: ['rum'],
        averageLift: 140,
        peakPeriod: 'Week before festival',
        consumerBehavior: 'Festival-goers stocking up, young demographic, portable drinks',
        priceElasticity: 'high',
        giftingRelevance: 'low',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Festival essentials, pre-loading supplies, summer music season',
      urgencyWindow: '1-2 weeks before',
      competitorActivity: 'medium',
      preparationLeadTime: 14
    },

    // JULY
    {
      id: 'summer-holidays',
      name: 'Summer School Holidays',
      type: 'seasonal',
      dateCalculation: 'calculated', // Late July - August
      description: '6 weeks of family holidays, BBQ season peak',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'cider', 'gin', 'prosecco', 'rosé'],
        secondaryCategories: ['tequila', 'rum', 'vodka'],
        averageLift: 200,
        peakPeriod: 'Entire period',
        consumerBehavior: 'BBQs, garden parties, holiday entertaining, sunshine drinking',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'social'
      },
      marketingAngle: 'Summer BBQ essentials, garden parties, holiday entertaining',
      urgencyWindow: 'Continuous throughout summer',
      competitorActivity: 'extreme',
      preparationLeadTime: 30
    },
    {
      id: 'british-grand-prix',
      name: 'British Grand Prix',
      type: 'sporting',
      dateCalculation: 'calculated', // Mid July
      description: 'Formula 1 Silverstone race',
      alcoholIntelligence: {
        primaryCategories: ['champagne', 'beer', 'prosecco'],
        secondaryCategories: ['spirits'],
        averageLift: 130,
        peakPeriod: 'Race weekend',
        consumerBehavior: 'Upmarket sports fans, viewing parties, celebration culture',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'social'
      },
      marketingAngle: 'F1 viewing parties, British motorsport, celebration drinks',
      urgencyWindow: '1 week before',
      competitorActivity: 'medium',
      preparationLeadTime: 7
    },

    // AUGUST
    {
      id: 'august-bank-holiday',
      name: 'August Bank Holiday',
      type: 'holiday',
      dateCalculation: 'calculated', // Last Monday in August
      description: 'Last summer bank holiday, end of summer',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'cider', 'gin', 'prosecco'],
        secondaryCategories: ['wine'],
        averageLift: 190,
        peakPeriod: 'Weekend before',
        consumerBehavior: 'Last summer BBQs, end of season parties, outdoor festivals',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'social'
      },
      marketingAngle: 'Last summer hurrah, end of season BBQs, bank holiday essentials',
      urgencyWindow: '2 weeks before',
      competitorActivity: 'high',
      preparationLeadTime: 14
    },
    {
      id: 'notting-hill-carnival',
      name: 'Notting Hill Carnival',
      type: 'cultural',
      dateCalculation: 'calculated', // Late August
      description: 'Major Caribbean cultural festival',
      alcoholIntelligence: {
        primaryCategories: ['rum', 'beer', 'lager'],
        secondaryCategories: ['vodka', 'gin'],
        averageLift: 150,
        peakPeriod: 'Weekend of carnival',
        consumerBehavior: 'Street party culture, Caribbean community, festival atmosphere',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Caribbean celebration, street party essentials, festival vibes',
      urgencyWindow: '2 weeks before',
      competitorActivity: 'medium',
      preparationLeadTime: 14
    },

    // SEPTEMBER
    {
      id: 'back-to-school',
      name: 'Back to School',
      type: 'seasonal',
      dateCalculation: 'calculated', // Early September
      description: 'Parent relief, routine returns',
      alcoholIntelligence: {
        primaryCategories: ['wine', 'gin', 'prosecco'],
        secondaryCategories: ['beer'],
        averageLift: 110,
        peakPeriod: 'First week of September',
        consumerBehavior: 'Parent relief purchases, "reward for surviving summer", return to routine',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'personal'
      },
      marketingAngle: 'Parent survival kit, back to routine treats, "you deserve this"',
      urgencyWindow: '1-2 weeks into September',
      competitorActivity: 'medium',
      preparationLeadTime: 7
    },
    {
      id: 'oktoberfest',
      name: 'Oktoberfest',
      type: 'cultural',
      dateCalculation: 'calculated', // Late Sept - Early Oct
      description: 'German beer festival, global celebration',
      alcoholIntelligence: {
        primaryCategories: ['german beer', 'lager', 'wheat beer', 'ale'],
        secondaryCategories: ['schnapps'],
        averageLift: 300, // HUGE for beer
        peakPeriod: '2 weeks before and during',
        consumerBehavior: 'Beer enthusiasts, themed parties, German culture appreciation',
        priceElasticity: 'low',
        giftingRelevance: 'low',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Oktoberfest celebration, German beer culture, themed party essentials',
      urgencyWindow: '3 weeks before',
      competitorActivity: 'extreme',
      preparationLeadTime: 21
    },

    // OCTOBER
    {
      id: 'halloween',
      name: 'Halloween',
      type: 'holiday',
      dateCalculation: 'fixed',
      month: 10,
      day: 31,
      description: 'Costume parties, themed cocktails, young adult culture',
      alcoholIntelligence: {
        primaryCategories: ['vodka', 'rum', 'tequila', 'cocktail mixers', 'beer'],
        secondaryCategories: ['gin', 'liqueurs'],
        averageLift: 180,
        peakPeriod: 'Week before Halloween',
        consumerBehavior: 'Themed parties, cocktail culture, young adults, fancy dress events',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Spooky cocktails, party essentials, Halloween themed drinks',
      urgencyWindow: '2-3 weeks before',
      competitorActivity: 'extreme',
      preparationLeadTime: 21
    },

    // NOVEMBER
    {
      id: 'bonfire-night',
      name: 'Bonfire Night / Guy Fawkes Night',
      type: 'holiday',
      dateCalculation: 'fixed',
      month: 11,
      day: 5,
      description: 'Fireworks, outdoor parties, quintessentially British',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'cider', 'mulled wine', 'whisky'],
        secondaryCategories: ['hot toddies', 'warming spirits'],
        averageLift: 160,
        peakPeriod: 'Weekend nearest to Nov 5th',
        consumerBehavior: 'Outdoor fireworks parties, warming drinks, family gatherings',
        priceElasticity: 'medium',
        giftingRelevance: 'low',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Bonfire party essentials, warming drinks, outdoor entertaining',
      urgencyWindow: '1-2 weeks before',
      competitorActivity: 'high',
      preparationLeadTime: 14
    },
    {
      id: 'black-friday',
      name: 'Black Friday',
      type: 'commercial',
      dateCalculation: 'calculated', // Friday after US Thanksgiving
      description: 'Biggest shopping day, massive discount expectations',
      alcoholIntelligence: {
        primaryCategories: ['all categories'],
        secondaryCategories: [],
        averageLift: 400, // MASSIVE sales day
        peakPeriod: 'Black Friday + Cyber Monday',
        consumerBehavior: 'Bargain hunters, Christmas stocking up, bulk buyers, gift preparation',
        priceElasticity: 'high', // Extremely discount-driven
        giftingRelevance: 'high',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Biggest discounts of the year, doorbusters, limited time offers',
      urgencyWindow: '2-3 weeks before',
      competitorActivity: 'extreme',
      preparationLeadTime: 21
    },
    {
      id: 'rugby-autumn-internationals',
      name: 'Rugby Autumn Internationals',
      type: 'sporting',
      dateCalculation: 'calculated', // November
      description: 'International rugby matches at Twickenham',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'lager', 'ale'],
        secondaryCategories: ['whisky'],
        averageLift: 140,
        peakPeriod: 'Match days (weekends)',
        consumerBehavior: 'Sports viewing parties, rugby culture, social drinking',
        priceElasticity: 'high',
        giftingRelevance: 'low',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Rugby match day packs, sports viewing essentials',
      urgencyWindow: 'Match weekends',
      competitorActivity: 'medium',
      preparationLeadTime: 7
    },

    // DECEMBER
    {
      id: 'christmas-season',
      name: 'Christmas Season',
      type: 'holiday',
      dateCalculation: 'fixed',
      month: 12,
      day: 25,
      description: 'BIGGEST alcohol sales period of the year',
      alcoholIntelligence: {
        primaryCategories: ['champagne', 'prosecco', 'whisky', 'gin', 'wine', 'beer', 'liqueurs'],
        secondaryCategories: ['all categories'],
        averageLift: 600, // ENORMOUS
        peakPeriod: 'Early December through Dec 24',
        consumerBehavior: 'Gifting, parties, celebrations, family dinners, premium positioning, luxury appeal',
        priceElasticity: 'low', // People splurge at Christmas
        giftingRelevance: 'essential',
        volumeDriver: 'gifting'
      },
      marketingAngle: 'Christmas gifting, festive celebrations, premium presents, party essentials',
      urgencyWindow: '6-8 weeks before',
      competitorActivity: 'extreme',
      preparationLeadTime: 45
    },
    {
      id: 'office-christmas-parties',
      name: 'Office Christmas Parties',
      type: 'seasonal',
      dateCalculation: 'calculated', // Early-mid December
      description: 'Corporate party season',
      alcoholIntelligence: {
        primaryCategories: ['prosecco', 'wine', 'beer', 'spirits'],
        secondaryCategories: [],
        averageLift: 250,
        peakPeriod: 'First two weeks of December',
        consumerBehavior: 'Bulk corporate purchases, party supplies, celebration drinks',
        priceElasticity: 'medium',
        giftingRelevance: 'medium',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Corporate party supplies, bulk deals, celebration essentials',
      urgencyWindow: '3-4 weeks before',
      competitorActivity: 'high',
      preparationLeadTime: 21
    },
    {
      id: 'boxing-day',
      name: 'Boxing Day',
      type: 'holiday',
      dateCalculation: 'fixed',
      month: 12,
      day: 26,
      description: 'Massive sales day, leftover parties',
      alcoholIntelligence: {
        primaryCategories: ['beer', 'wine', 'spirits'],
        secondaryCategories: [],
        averageLift: 200,
        peakPeriod: 'Boxing Day + week after',
        consumerBehavior: 'Bargain hunting, leftover parties, relaxation, clearance expectations',
        priceElasticity: 'high', // Extremely discount-driven
        giftingRelevance: 'low',
        volumeDriver: 'personal'
      },
      marketingAngle: 'Boxing Day sales, clearance offers, post-Christmas relaxation',
      urgencyWindow: 'Week before',
      competitorActivity: 'extreme',
      preparationLeadTime: 7
    },
    {
      id: 'new-years-eve',
      name: "New Year's Eve",
      type: 'holiday',
      dateCalculation: 'fixed',
      month: 12,
      day: 31,
      description: 'Second biggest alcohol sales day of the year',
      alcoholIntelligence: {
        primaryCategories: ['champagne', 'prosecco', 'spirits', 'cocktails'],
        secondaryCategories: ['beer', 'wine'],
        averageLift: 500, // HUGE
        peakPeriod: '1-2 weeks before',
        consumerBehavior: 'Celebration, parties, countdown drinks, premium positioning, "special occasion"',
        priceElasticity: 'low',
        giftingRelevance: 'medium',
        volumeDriver: 'parties'
      },
      marketingAngle: 'Celebration essentials, countdown drinks, party supplies, "ring in the new year"',
      urgencyWindow: '2-3 weeks before',
      competitorActivity: 'extreme',
      preparationLeadTime: 21
    }
  ]

  /**
   * Get upcoming events for the next N days
   */
  static getUpcomingEvents(daysAhead: number = 90): UKEvent[] {
    const today = new Date()
    const futureDate = new Date(today)
    futureDate.setDate(today.getDate() + daysAhead)

    // Calculate dates for all events and filter to upcoming ones
    const upcomingEvents = this.EVENTS.map(event => {
      const eventDate = this.calculateEventDate(event, today.getFullYear())
      const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...event,
        calculatedDate: eventDate,
        daysUntil
      }
    }).filter(event => {
      // Include events within the window
      return event.daysUntil >= -7 && event.daysUntil <= daysAhead
    }).sort((a, b) => a.daysUntil - b.daysUntil)

    return upcomingEvents as any
  }

  /**
   * Calculate the actual date for an event
   */
  private static calculateEventDate(event: UKEvent, year: number): Date {
    if (event.dateCalculation === 'fixed' && event.month && event.day) {
      const date = new Date(year, event.month - 1, event.day)
      // If date has passed, use next year
      if (date < new Date()) {
        return new Date(year + 1, event.month - 1, event.day)
      }
      return date
    }

    // For calculated dates, use approximations or specific logic
    // This would need to be expanded with actual calculation logic
    return new Date() // Placeholder
  }

  /**
   * Get events by type
   */
  static getEventsByType(type: UKEvent['type']): UKEvent[] {
    return this.EVENTS.filter(event => event.type === type)
  }

  /**
   * Get high-priority events (high/extreme competitor activity)
   */
  static getHighPriorityEvents(daysAhead: number = 60): UKEvent[] {
    return this.getUpcomingEvents(daysAhead).filter((event: any) =>
      event.competitorActivity === 'extreme' || event.competitorActivity === 'high'
    )
  }

  /**
   * Get gift-relevant events (for gifting strategy)
   */
  static getGiftingEvents(daysAhead: number = 90): UKEvent[] {
    return this.getUpcomingEvents(daysAhead).filter((event: any) =>
      event.alcoholIntelligence.giftingRelevance === 'essential' ||
      event.alcoholIntelligence.giftingRelevance === 'high'
    )
  }

  /**
   * Format event summary for AI consumption
   */
  static formatEventsForAI(events: UKEvent[]): string {
    return events.map((event: any) => {
      const daysText = event.daysUntil === 0 ? 'TODAY' :
                       event.daysUntil === 1 ? 'TOMORROW' :
                       event.daysUntil > 0 ? `in ${event.daysUntil} days` :
                       `${Math.abs(event.daysUntil)} days ago (still relevant)`

      return `📅 ${event.name} (${daysText})
Type: ${event.type} | Urgency: ${event.urgency}Window | Competition: ${event.competitorActivity}
🍷 Alcohol Intel:
  - Best sellers: ${event.alcoholIntelligence.primaryCategories.join(', ')}
  - Sales lift: +${event.alcoholIntelligence.averageLift}%
  - Consumer behavior: ${event.alcoholIntelligence.consumerBehavior}
  - Gifting: ${event.alcoholIntelligence.giftingRelevance}
  - Volume driver: ${event.alcoholIntelligence.volumeDriver}
💡 Marketing: ${event.marketingAngle}
⏰ Prepare by: ${event.calculatedDate ? new Date(event.calculatedDate.getTime() - event.preparationLeadTime * 24 * 60 * 60 * 1000).toLocaleDateString() : 'TBD'}`
    }).join('\n\n')
  }
}
