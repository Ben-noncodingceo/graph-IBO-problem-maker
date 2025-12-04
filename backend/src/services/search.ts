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
        url.searchParams.append('num', '5');
        url.searchParams.append('as_ylo', '2015'); // Papers from 2015+

        const res = await fetch(url.toString());
        const data = await res.json() as any;

        if (data.organic_results) {
          return data.organic_results.map((r: any) => ({
            title: r.title,
            link: r.link,
            snippet: r.snippet,
            year: r.publication_info?.summary?.match(/\d{4}/)?.[0] || 'Recent',
            authors: r.publication_info?.summary?.split('-')[0]?.trim() || 'Unknown'
          }));
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
    // Return relevant-looking mock papers
    return [
      {
        title: `Recent Advances in ${subject}: A Comprehensive Review`,
        link: 'https://example.com/paper1',
        snippet: `This paper discusses the latest mechanisms discovered in ${subject}, focusing on molecular pathways...`,
        year: '2023',
        authors: 'Smith J., Doe A.'
      },
      {
        title: `Novel Mechanisms in ${subject} Regulation`,
        link: 'https://example.com/paper2',
        snippet: `We identify a key regulatory protein involved in the ${subject} process, demonstrating its role in...`,
        year: '2024',
        authors: 'Wang L., Chen Y.'
      },
      {
        title: `Structural Analysis of Complexes in ${subject}`,
        link: 'https://example.com/paper3',
        snippet: `Cryo-EM structures reveal the detailed architecture of the complex, shedding light on function...`,
        year: '2022',
        authors: 'Muller H., et al.'
      }
    ];
  }
}
