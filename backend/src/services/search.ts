export interface Paper {
  title: string;
  link: string;
  snippet: string;
  year?: string;
  authors?: string;
}

export class SearchService {
  constructor(private apiKey?: string) {}

  async searchPapers(subject: string, keywords: string[]): Promise<Paper[]> {
    const query = `${subject} ${keywords.join(' ')} biology research paper`;
    
    // Real API Implementation (Optional)
    if (this.apiKey) {
      try {
        const url = new URL('https://serpapi.com/search');
        url.searchParams.append('engine', 'google_scholar');
        url.searchParams.append('q', query);
        url.searchParams.append('api_key', this.apiKey);
        url.searchParams.append('num', '7'); // Request 7 papers
        url.searchParams.append('as_ylo', '2015'); // Papers from 2015+

        const res = await fetch(url.toString());
        const data = await res.json() as any;

        if (data.organic_results) {
          const results = data.organic_results.map((r: any) => ({
            title: r.title,
            link: r.link,
            snippet: r.snippet,
            year: r.publication_info?.summary?.match(/\d{4}/)?.[0] || 'Recent',
            authors: r.publication_info?.summary?.split('-')[0]?.trim() || 'Unknown'
          }));
          return this.shuffle(results).slice(0, 7);
        }
      } catch (e) {
        console.error("Search API failed, falling back to mock", e);
      }
    }

    // Mock Fallback
    console.log(`[Mock Search] Query: ${query}`);
    return this.getMockPapers(subject);
  }

  private getMockPapers(subject: string): Paper[] {
    const basePapers: Paper[] = [
      {
        title: `Recent Advances in ${subject}: A Comprehensive Review`,
        link: 'https://example.com/paper1',
        snippet: `This paper discusses the latest mechanisms discovered in ${subject}, focusing on molecular pathways and cellular interactions observed in recent studies.`,
        year: '2023',
        authors: 'Smith J., Doe A.'
      },
      {
        title: `Novel Mechanisms in ${subject} Regulation`,
        link: 'https://example.com/paper2',
        snippet: `We identify a key regulatory protein involved in the ${subject} process, demonstrating its role in maintaining homeostasis under stress conditions.`,
        year: '2024',
        authors: 'Wang L., Chen Y.'
      },
      {
        title: `Structural Analysis of Complexes in ${subject}`,
        link: 'https://example.com/paper3',
        snippet: `Cryo-EM structures reveal the detailed architecture of the complex, shedding light on function and potential therapeutic targets.`,
        year: '2022',
        authors: 'Muller H., et al.'
      },
      {
        title: `Evolutionary Perspectives on ${subject}`,
        link: 'https://example.com/paper4',
        snippet: `Comparative genomic analysis across species highlights conserved elements in ${subject}, suggesting a common ancestral origin.`,
        year: '2021',
        authors: 'Darwin C. II'
      },
      {
        title: `The Role of ${subject} in Disease Pathogenesis`,
        link: 'https://example.com/paper5',
        snippet: `Investigating how dysregulation of ${subject} contributes to various disorders, providing new insights for diagnosis and treatment.`,
        year: '2023',
        authors: 'House G.'
      },
      {
        title: `Technological Breakthroughs in Studying ${subject}`,
        link: 'https://example.com/paper6',
        snippet: `New imaging techniques allow for real-time observation of ${subject} dynamics at single-molecule resolution.`,
        year: '2025',
        authors: 'Stark T.'
      },
      {
        title: `Metabolic Implications of ${subject}`,
        link: 'https://example.com/paper7',
        snippet: `This study links ${subject} pathways to broader metabolic networks, influencing energy production and storage.`,
        year: '2022',
        authors: 'Banner B.'
      },
      {
        title: `Environmental Impacts on ${subject}`,
        link: 'https://example.com/paper8',
        snippet: `How climate change and pollution affect ${subject} in natural populations, with implications for conservation.`,
        year: '2024',
        authors: 'Ivy P.'
      },
      {
        title: `Mathematical Modeling of ${subject} Kinetics`,
        link: 'https://example.com/paper9',
        snippet: `Using differential equations to predict the behavior of ${subject} systems under varying initial conditions.`,
        year: '2021',
        authors: 'Nash J.'
      },
      {
        title: `Synthetic Biology Approaches to ${subject}`,
        link: 'https://example.com/paper10',
        snippet: `Engineering novel biological circuits to mimic or enhance ${subject} functions for industrial applications.`,
        year: '2025',
        authors: 'Venter C.'
      }
    ];

    // Randomly select 7 unique papers
    return this.shuffle(basePapers).slice(0, 7);
  }

  private shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
