export const IBO_SUBJECTS_DATA = {
  'Cell Biology': {
    zh: '细胞生物学',
    keywords: [
      'Membrane Structure', 'Organelles', 'Cell Cycle', 'Mitosis', 'Meiosis', 
      'Cell Signaling', 'Apoptosis', 'Stem Cells', 'Cytoskeleton', 'Endocytosis', 
      'Exocytosis', 'Protein Transport', 'Cell Junctions', 'Extracellular Matrix'
    ]
  },
  'Plant Anatomy and Physiology': {
    zh: '植物解剖与生理',
    keywords: [
      'Photosynthesis', 'Transpiration', 'Plant Hormones', 'Xylem Transport', 'Phloem Transport',
      'Root Structure', 'Leaf Anatomy', 'Flower Structure', 'Pollination', 'Seed Germination',
      'Plant Tropisms', 'Photoperiodism', 'Secondary Metabolites', 'Plant Defense'
    ]
  },
  'Animal Anatomy and Physiology': {
    zh: '动物解剖与生理',
    keywords: [
      'Digestive System', 'Circulatory System', 'Respiratory System', 'Excretory System', 'Nervous System',
      'Endocrine System', 'Immune System', 'Reproductive System', 'Musculoskeletal System', 'Homeostasis',
      'Thermoregulation', 'Osmoregulation', 'Blood Components', 'Gas Exchange'
    ]
  },
  'Ethology': {
    zh: '动物行为学',
    keywords: [
      'Innate Behavior', 'Learned Behavior', 'Social Behavior', 'Mating Systems', 'Foraging Behavior',
      'Altruism', 'Communication', 'Migration', 'Circadian Rhythms', 'Territoriality',
      'Parental Care', 'Imprinting', 'Classical Conditioning', 'Operant Conditioning'
    ]
  },
  'Genetics and Evolution': {
    zh: '遗传学与进化',
    keywords: [
      'Mendelian Genetics', 'DNA Replication', 'Transcription', 'Translation', 'Gene Regulation',
      'Mutations', 'Natural Selection', 'Genetic Drift', 'Speciation', 'Phylogenetics',
      'Population Genetics', 'Hardy-Weinberg Equilibrium', 'Epigenetics', 'Linkage Mapping'
    ]
  },
  'Ecology': {
    zh: '生态学',
    keywords: [
      'Ecosystems', 'Biomes', 'Population Dynamics', 'Community Ecology', 'Energy Flow',
      'Nutrient Cycles', 'Biodiversity', 'Conservation Biology', 'Succession', 'Trophic Levels',
      'Symbiosis', 'Niche', 'Invasive Species', 'Climate Change'
    ]
  },
  'Biosystematics': {
    zh: '生物系统学',
    keywords: [
      'Taxonomy', 'Cladistics', 'Phylogeny', 'Species Concepts', 'Binomial Nomenclature',
      'Dichotomous Keys', 'Domains of Life', 'Kingdoms', 'Plant Classification', 'Animal Classification',
      'Fungi', 'Protists', 'Bacteria', 'Archaea'
    ]
  },
  'Biochemistry': {
    zh: '生物化学',
    keywords: [
      'Enzymes', 'Proteins', 'Carbohydrates', 'Lipids', 'Nucleic Acids',
      'Metabolism', 'Glycolysis', 'Krebs Cycle', 'Oxidative Phosphorylation', 'Amino Acids',
      'Vitamin Functions', 'Enzyme Kinetics', 'Allosteric Regulation', 'Bioenergetics'
    ]
  },
  'Molecular Biology': {
    zh: '分子生物学',
    keywords: [
      'PCR', 'Gel Electrophoresis', 'Cloning', 'CRISPR-Cas9', 'DNA Sequencing',
      'Recombinant DNA', 'Gene Expression', 'RNA Interference', 'Plasmids', 'Restriction Enzymes',
      'Southern Blot', 'Western Blot', 'Genomics', 'Proteomics'
    ]
  },
  'Microbiology': {
    zh: '微生物学',
    keywords: [
      'Bacteria Structure', 'Virus Structure', 'Microbial Growth', 'Antibiotics', 'Pathogens',
      'Fermentation', 'Gram Staining', 'Bacterial Conjugation', 'Transformation', 'Transduction',
      'Prions', 'Fungi', 'Protozoa', 'Microbiome'
    ]
  },
  'Biotechnology': {
    zh: '生物技术',
    keywords: [
      'Genetic Engineering', 'Bioreactors', 'Biosensors', 'Tissue Engineering', 'GMOs',
      'Biofuels', 'Gene Therapy', 'Forensic Biology', 'Agricultural Biotechnology', 'Pharmaceutical Biotechnology',
      'Stem Cell Therapy', 'Vaccine Development', 'Monoclonal Antibodies', 'Synthetic Biology'
    ]
  },
  'Bioinformatics': {
    zh: '生物信息学',
    keywords: [
      'Sequence Alignment', 'BLAST', 'Protein Structure Prediction', 'Phylogenetic Trees', 'Genomic Databases',
      'Transcriptomics', 'Systems Biology', 'Homology Modeling', 'Molecular Docking', 'Data Mining',
      'Gene Annotation', 'Metagenomics', 'Structural Biology', 'Computational Biology'
    ]
  },
  'Neurobiology': {
    zh: '神经生物学',
    keywords: [
      'Neurons', 'Action Potential', 'Synapses', 'Neurotransmitters', 'Central Nervous System',
      'Peripheral Nervous System', 'Sensory Systems', 'Motor Control', 'Brain Structure', 'Neuroplasticity',
      'Memory and Learning', 'Vision', 'Hearing', 'Neurodegenerative Diseases'
    ]
  }
} as const;

export type IboSubject = keyof typeof IBO_SUBJECTS_DATA;
export const IBO_SUBJECTS = Object.keys(IBO_SUBJECTS_DATA) as IboSubject[];
