
import type { Accessory, Coupon, Testimonial, User, Post, Comment, BadgeCriteriaData, PendingCommentDisplay, CategoryCount, TopAccessoryInfo, RecentCommentInfo, AnalyticsData } from './types';
import { allBadges, generateBadgeCriteriaData } from './badges'; // Import badge definitions and criteria data generator

let accessories: Accessory[] = [
  {
    id: '1',
    name: 'Wireless Charging Stand',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'charger stand',
    shortDescription: 'Fast wireless charging for your smartphone.',
    fullDescription: 'Experience the convenience of fast wireless charging with this sleek and modern charging stand. Compatible with all Qi-enabled devices, it offers up to 15W charging speed. Its ergonomic design allows you to use your phone in portrait or landscape mode while charging.',
    affiliateLink: '#',
    price: '29.99',
    category: 'Chargers',
    aiSummary: 'A fast, 15W wireless charging stand with an ergonomic design for Qi-enabled devices, allowing portrait or landscape use during charging.',
    isDeal: true,
    likedBy: ['user-1', 'admin-1', 'user-2'],
    comments: [
      { id: 'comment-1-1', userId: 'user-1', userName: 'Usuário Comum', text: 'Ótimo carregador, muito prático!', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'approved' },
      { id: 'comment-1-2', userId: 'user-2', userName: 'Outro Usuário', text: 'Precisa de moderação este comentário?', createdAt: new Date(Date.now() - 3600000).toISOString(), status: 'pending_review' },
      { id: 'comment-1-3', userId: 'admin-1', userName: 'Administrador', text: 'Concordo, excelente produto.', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'approved' },
    ],
    embedHtml: '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
  },
  {
    id: '2',
    name: 'Bluetooth Noise-Cancelling Headphones',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'headphones audio',
    shortDescription: 'Immersive sound with active noise cancellation.',
    fullDescription: 'Dive into a world of pure sound with these Bluetooth headphones featuring active noise cancellation. Enjoy crystal-clear audio, deep bass, and up to 30 hours of playtime on a single charge. Soft memory foam earcups provide all-day comfort.',
    affiliateLink: '#',
    price: '79.50',
    category: 'Audio',
    aiSummary: 'Bluetooth headphones with active noise cancellation, 30-hour playtime, and comfortable memory foam earcups for immersive audio.',
    likedBy: ['user-1'],
    comments: [
        { id: 'comment-2-1', userId: 'user-1', userName: 'Usuário Comum', text: 'Esse fone é muito bom mas será que meu comentário passa pela moderação?', createdAt: new Date(Date.now() - 7200000).toISOString(), status: 'pending_review' },
        { id: 'comment-2-2', userId: 'user-2', userName: 'Outro Usuário', text: 'Cancelamento de ruído funciona bem.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'approved' },
    ],
    embedHtml: '',
  },
  {
    id: '3',
    name: 'Protective Silicone Case',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'phone case',
    shortDescription: 'Slim and durable protection for your device.',
    fullDescription: 'Keep your smartphone safe from drops and scratches with this slim yet durable silicone case. The soft-touch finish provides a comfortable grip, while precise cutouts ensure easy access to all ports and buttons. Available in multiple colors.',
    affiliateLink: '#',
    price: '12.99',
    category: 'Cases',
    isDeal: true,
    likedBy: ['admin-1'],
    comments: [
      { id: 'comment-3-1', userId: 'user-1', userName: 'Usuário Comum', text: 'Capa bonita e protege bem.', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'approved' },
    ],
    embedHtml: '',
  },
  {
    id: '4',
    name: 'Portable Power Bank 10000mAh',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'power bank',
    shortDescription: 'Compact power bank for charging on the go.',
    fullDescription: 'Never run out of battery with this compact 10000mAh portable power bank. It features dual USB ports for charging multiple devices simultaneously and an LED indicator to show remaining power. Small enough to fit in your pocket or bag.',
    affiliateLink: '#',
    price: '22.00',
    category: 'Power Banks',
    aiSummary: 'A compact 10000mAh power bank with dual USB ports and LED indicator for on-the-go charging.',
    likedBy: ['user-1', 'admin-1'],
    comments: [
       { id: 'comment-4-1', userId: 'admin-1', userName: 'Administrador', text: 'Excelente para viagens!', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'approved' },
       { id: 'comment-4-2', userId: 'user-2', userName: 'Outro Usuário', text: 'Bom custo-benefício.', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), status: 'approved' },
    ],
    embedHtml: '',
  },
   {
    id: '5',
    name: 'Gaming Mouse RGB',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'gaming mouse',
    shortDescription: 'High-precision gaming mouse with customizable RGB lighting.',
    fullDescription: 'Dominate your games with this high-precision gaming mouse. Featuring an adjustable DPI sensor, programmable buttons, and customizable RGB lighting, it offers both performance and style. Ergonomically designed for comfort during long gaming sessions.',
    affiliateLink: '#',
    price: '45.90',
    category: 'Peripherals',
    aiSummary: 'High-precision gaming mouse with adjustable DPI, programmable buttons, and RGB lighting for performance and style.',
    likedBy: ['user-2'],
    comments: [],
    embedHtml: '',
  },
  {
    id: '6',
    name: 'Smartwatch Fitness Tracker',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'smartwatch fitness',
    shortDescription: 'Track your fitness and receive notifications on your wrist.',
    fullDescription: 'Stay on top of your health and connected with this smartwatch fitness tracker. Monitors heart rate, sleep, steps, and various workouts. Receive notifications for calls, messages, and apps directly on your wrist. Long-lasting battery and water-resistant design.',
    affiliateLink: '#',
    price: '59.99',
    category: 'Wearables',
    isDeal: true,
    likedBy: ['user-1', 'user-2', 'admin-1'],
    comments: [
       { id: 'comment-6-1', userId: 'user-1', userName: 'Usuário Comum', text: 'Adorei o smartwatch, muito útil!', createdAt: new Date(Date.now() - 3600000 * 10).toISOString(), status: 'approved' },
    ],
    embedHtml: '',
  }
];

const coupons: Coupon[] = [
  {
    id: 'coupon1',
    code: 'SUMMER20',
    description: 'Get 20% off on all summer accessories.',
    discount: '20% OFF',
    expiryDate: '2024-08-31',
    store: 'AccessoryStore'
  },
  {
    id: 'coupon2',
    code: 'AUDIOFUN',
    description: '15% discount on headphones and speakers.',
    discount: '15% OFF',
    expiryDate: '2024-09-15',
    store: 'SoundGoodies'
  },
  {
    id: 'coupon3',
    code: 'FREESHIP',
    description: 'Free shipping on orders over R$50.',
    discount: 'Free Shipping',
    store: 'GadgetHub'
  },
];

const testimonials: Testimonial[] = [
  {
    id: 'testimonial1',
    name: 'Ana Silva',
    quote: 'Encontrei os melhores acessórios aqui! A seleção de ofertas do dia é incrível e os resumos de IA me ajudam a decidir rapidamente. Recomendo!',
    role: 'Cliente Satisfeita',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarHint: 'woman portrait',
  },
  {
    id: 'testimonial2',
    name: 'Carlos Pereira',
    quote: 'Os cupons promocionais são ótimos! Consegui um bom desconto na minha última compra de fones de ouvido. O site é fácil de navegar.',
    role: 'Entusiasta de Gadgets',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarHint: 'man portrait',
  },
  {
    id: 'testimonial3',
    name: 'Juliana Costa',
    quote: 'Adoro a variedade de produtos e a clareza das descrições. A funcionalidade de favoritar é muito útil para salvar itens que quero comprar depois.',
    role: 'Compradora Online',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarHint: 'person smiling',
  }
];

export let mockUsers: User[] = [
  { id: 'user-1', name: 'Usuário Comum', email: 'user@example.com', password: 'password123', isAdmin: false, followers: ['admin-1'], following: ['admin-1'], avatarUrl: 'https://placehold.co/150x150.png', avatarHint: 'user avatar', bio: 'Apenas um usuário comum explorando o mundo dos acessórios!', badges: [] },
  { id: 'admin-1', name: 'Administrador', email: 'admin@example.com', password: 'adminpassword', isAdmin: true, followers: ['user-1'], following: ['user-1', 'user-2'], avatarUrl: 'https://placehold.co/150x150.png', avatarHint: 'admin avatar', bio: 'Gerenciando a plataforma SmartAcessorios.', badges: [] },
  { id: 'user-2', name: 'Outro Usuário', email: 'existing@example.com', password: 'password456', isAdmin: false, followers: ['admin-1'], following: [], avatarUrl: 'https://placehold.co/150x150.png', avatarHint: 'another user', bio: 'Entusiasta de tecnologia e gadgets.', badges: [] },
];

let mockPosts: Post[] = [
  {
    id: 'post-1',
    slug: 'guia-completo-para-carregadores-sem-fio',
    title: 'Guia Completo para Carregadores Sem Fio: Tudo o que Você Precisa Saber',
    excerpt: 'Descubra como funcionam os carregadores sem fio, os diferentes tipos disponíveis e como escolher o melhor para o seu smartphone.',
    content: '<p>Os carregadores sem fio se tornaram um acessório indispensável para muitos usuários de smartphones. A conveniência de simplesmente colocar o telefone em uma base para carregar, sem se preocupar com cabos, é inegável. Mas como eles funcionam? Quais são os padrões? E como escolher o ideal para suas necessidades?</p><h3>Como Funciona o Carregamento Sem Fio?</h3><p>O carregamento sem fio, na maioria dos casos, utiliza o princípio da indução eletromagnética. Uma bobina transmissora no carregador cria um campo eletromagnético oscilante. Quando a bobina receptora no smartphone está próxima, esse campo induz uma corrente elétrica na bobina do telefone, que é então convertida em energia para carregar a bateria.</p><h3>Padrões de Carregamento</h3><p>O padrão mais comum e amplamente adotado é o <strong>Qi</strong> (pronuncia-se "tchi"), desenvolvido pelo Wireless Power Consortium (WPC). A maioria dos smartphones modernos com capacidade de carregamento sem fio é compatível com Qi. Existem outros padrões, mas o Qi domina o mercado de consumo.</p><h3>Tipos de Carregadores Sem Fio</h3><ul><li><strong>Pads (Almofadas):</strong> São superfícies planas onde você deita o telefone.</li><li><strong>Stands (Suportes):</strong> Permitem que o telefone fique em pé, ideal para visualização de notificações ou vídeos durante o carregamento.</li><li><strong>Carregadores Veiculares:</strong> Projetados para uso em carros, muitas vezes combinando suporte e carregamento.</li><li><strong>Power Banks com Carregamento Sem Fio:</strong> Baterias portáteis que também oferecem a funcionalidade de carregamento sem fio.</li></ul><h3>O que Considerar ao Escolher</h3><ol><li><strong>Potência (Watts):</strong> A velocidade de carregamento é medida em watts (W). Carregadores mais rápidos oferecem 10W, 15W ou até mais. Verifique a potência máxima suportada pelo seu smartphone.</li><li><strong>Compatibilidade:</strong> Certifique-se de que o carregador é compatível com o padrão Qi e com o seu dispositivo.</li><li><strong>Design e Formato:</strong> Escolha entre pad, stand ou outros formatos conforme sua preferência e uso.</li><li><strong>Recursos Adicionais:</strong> Alguns carregadores vêm com LEDs indicadores, ventoinhas para resfriamento (para carregamentos mais rápidos) ou capacidade de carregar múltiplos dispositivos (ex: telefone e fones de ouvido).</li><li><strong>Marca e Segurança:</strong> Opte por marcas conceituadas para garantir a segurança e a eficiência do carregamento, evitando superaquecimento ou danos ao dispositivo.</li></ol><p>Investir em um bom carregador sem fio pode simplificar muito o seu dia a dia. Com as informações certas, você pode fazer uma escolha informada e aproveitar ao máximo essa tecnologia.</p>',
    imageUrl: 'https://placehold.co/800x450.png',
    imageHint: 'blog wireless charging',
    authorName: 'Equipe SmartAcessorios',
    authorAvatarUrl: 'https://placehold.co/100x100.png',
    authorAvatarHint: 'team avatar',
    category: 'Tecnologia',
    tags: ['carregadores sem fio', 'Qi', 'smartphones', 'tecnologia'],
    publishedAt: '2024-07-28T10:00:00Z',
    embedHtml: '<iframe width="560" height="315" src="https://www.youtube.com/embed/vCHy4qF1xSY" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
  },
  {
    id: 'post-2',
    slug: '5-acessorios-essenciais-para-seu-smartphone-em-2024',
    title: '5 Acessórios Essenciais para seu Smartphone em 2024',
    excerpt: 'Maximizando a utilidade do seu smartphone com os acessórios certos. De power banks a fones de ouvido, veja nossa lista dos indispensáveis.',
    content: '<p>Seu smartphone é uma ferramenta poderosa, mas com os acessórios certos, ele pode se tornar ainda mais versátil e indispensável. Em 2024, alguns acessórios se destacam pela sua utilidade e capacidade de aprimorar a experiência do usuário.</p><h3>1. Power Bank de Alta Capacidade com Carregamento Rápido</h3><p>Com o uso cada vez mais intenso dos smartphones, uma bateria externa confiável é crucial. Procure por modelos com pelo menos 10.000mAh e suporte a tecnologias de carregamento rápido como Power Delivery (PD) ou Quick Charge (QC).</p><h3>2. Fones de Ouvido Bluetooth com Cancelamento de Ruído</h3><p>Seja para trabalho, lazer ou deslocamento, fones de ouvido de qualidade são essenciais. Modelos TWS (True Wireless Stereo) com ANC (Active Noise Cancellation) oferecem liberdade de movimento e imersão sonora, bloqueando ruídos externos.</p><h3>3. Carregador de Parede GaN (Nitrito de Gálio)</h3><p>Os carregadores GaN são menores, mais eficientes e geram menos calor que os tradicionais. Muitos vêm com múltiplas portas, permitindo carregar seu smartphone, tablet e laptop simultaneamente com um único adaptador compacto.</p><h3>4. Película Protetora de Tela de Qualidade</h3><p>Proteger a tela do seu investimento é fundamental. Películas de vidro temperado ou hidrogel de boa qualidade podem prevenir arranhões e danos por impacto, mantendo a sensibilidade ao toque e a clareza da tela.</p><h3>5. Suporte Veicular com Carregamento Sem Fio</h3><p>Para quem dirige, um bom suporte veicular é indispensável para navegação e chamadas hands-free. Modelos com carregamento sem fio Qi integrado adicionam a conveniência de manter o celular carregado durante o trajeto.</p><p>Esses são apenas alguns exemplos, mas investir nesses acessórios pode transformar a maneira como você usa seu smartphone, tornando-o mais prático, durável e agradável no dia a dia.</p>',
    imageUrl: 'https://placehold.co/800x450.png',
    imageHint: 'blog smartphone accessories',
    authorName: 'Redação Tech',
    authorAvatarUrl: 'https://placehold.co/100x100.png',
    authorAvatarHint: 'tech writer',
    category: 'Dicas',
    tags: ['acessórios', 'smartphones', 'dicas', '2024'],
    publishedAt: '2024-07-25T14:30:00Z',
    embedHtml: '',
  },
  {
    id: 'post-3',
    slug: 'entendendo-as-diferencas-entre-cabos-usb-c',
    title: 'Entendendo as Diferenças Entre Cabos USB-C: Nem Todos São Iguais',
    excerpt: 'USB-C é o novo padrão, mas você sabia que existem grandes diferenças entre os cabos? Aprenda a identificar o cabo certo para suas necessidades.',
    content: '<p>O conector USB-C se tornou o padrão para a maioria dos dispositivos modernos, desde smartphones e laptops até fones de ouvido e periféricos. No entanto, nem todos os cabos USB-C são criados iguais. As diferenças podem impactar significativamente a velocidade de carregamento e a transferência de dados.</p><h3>O Conector vs. o Protocolo</h3><p>É importante entender que USB-C refere-se ao formato físico do conector. Os protocolos que ele suporta (como USB 2.0, USB 3.1 Gen 1, USB 3.1 Gen 2, USB4, Thunderbolt 3 e 4) determinam suas capacidades.</p><h3>Velocidade de Transferência de Dados</h3><ul><li><strong>USB 2.0:</strong> Muitos cabos USB-C baratos suportam apenas velocidades de USB 2.0 (até 480 Mbps). São adequados para carregamento básico e transferência de dados leves.</li><li><strong>USB 3.1 Gen 1 (ou USB 3.2 Gen 1x1):</strong> Oferece até 5 Gbps. Bom para discos rígidos externos e transferências de arquivos maiores.</li><li><strong>USB 3.1 Gen 2 (ou USB 3.2 Gen 2x1):</strong> Atinge até 10 Gbps. Ideal para SSDs externos rápidos e docking stations.</li><li><strong>USB 3.2 Gen 2x2:</strong> Pode chegar a 20 Gbps, mas requer dispositivos compatíveis em ambas as pontas.</li><li><strong>USB4 e Thunderbolt:</strong> Oferecem as maiores velocidades (até 40 Gbps) e podem suportar saída de vídeo e outros recursos avançados. Cabos Thunderbolt são geralmente mais caros e possuem um ícone de raio.</li></ul><h3>Capacidade de Carregamento (Power Delivery)</h3><p>A especificação USB Power Delivery (PD) permite que cabos USB-C forneçam significativamente mais energia do que os padrões USB anteriores. Para carregamento rápido, você precisa de um cabo que suporte USB PD e um carregador compatível.</p><ul><li>Cabos básicos podem suportar até 60W.</li><li>Cabos com E-Marker (um chip que comunica as capacidades do cabo) podem suportar 100W ou até 240W com a especificação USB PD 3.1 Extended Power Range (EPR).</li></ul><h3>Saída de Vídeo</h3><p>Alguns cabos USB-C suportam DisplayPort Alternate Mode, permitindo a transmissão de vídeo para monitores externos. Nem todos os cabos USB-C têm essa capacidade, especialmente os mais simples focados apenas em carregamento e dados USB 2.0.</p><h3>Como Escolher o Cabo Certo?</h3><ol><li><strong>Verifique as especificações:</strong> Procure por informações sobre a velocidade de transferência de dados (Gbps) e a capacidade de carregamento (W ou suporte a PD).</li><li><strong>Considere o uso:</strong> Para carregamento simples, um cabo básico pode ser suficiente. Para transferir arquivos grandes ou conectar a um monitor, você precisará de um cabo com especificações mais altas.</li><li><strong>Marca e Certificação:</strong> Cabos de marcas desconhecidas ou sem certificação podem não entregar o desempenho prometido ou até mesmo danificar seus dispositivos. Procure por certificações do USB-IF (USB Implementers Forum) se possível.</li></ol><p>Entender essas nuances ajuda a garantir que você está obtendo o máximo de seus dispositivos e evitando gargalos de desempenho ou carregamento lento por causa de um cabo inadequado.</p>',
    imageUrl: 'https://placehold.co/800x450.png',
    imageHint: 'blog usb c cables',
    authorName: 'Dr. Conecta',
    authorAvatarUrl: 'https://placehold.co/100x100.png',
    authorAvatarHint: 'tech expert',
    category: 'Guias',
    tags: ['USB-C', 'cabos', 'tecnologia', 'guias', 'power delivery'],
    publishedAt: '2024-07-22T09:15:00Z',
    embedHtml: '',
  }
];

export function getUserById(id: string): User | undefined {
  const user = mockUsers.find(user => user.id === id);
  if (user) {
    return {
      ...user,
      badges: user.badges || [], // Ensure badges array exists
    };
  }
  return undefined;
}

export function getUserByEmail(email: string): User | undefined {
  const user = mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
  if (user) {
    return {
      ...user,
      badges: user.badges || [],
    };
  }
  return undefined;
}

export function addUser(user: User): boolean {
  if (getUserByEmail(user.email)) {
    return false; // User already exists
  }
  // For this mock, we add to the array.
  // Ensure new users have empty arrays for followers, following, and badges.
  const newUserWithDefaults = {
    ...user,
    followers: [],
    following: [],
    badges: [],
  };
  mockUsers.push(newUserWithDefaults);
  return true;
}

export function getAllAccessories(): Accessory[] {
  return accessories.map(acc => ({
    ...acc,
    comments: Array.isArray(acc.comments) ? acc.comments : [],
  }));
}

export function getAccessoryById(id: string): Accessory | undefined {
  const accessory = accessories.find(acc => acc.id === id);
  if (accessory) {
    return {
      ...accessory,
      comments: Array.isArray(accessory.comments) ? accessory.comments : [],
    };
  }
  return undefined;
}

export function toggleLikeOnAccessory(accessoryId: string, userId: string): { likedBy: string[], likesCount: number } | null {
  const accessoryIndex = accessories.findIndex(acc => acc.id === accessoryId);
  if (accessoryIndex === -1) {
    return null;
  }
  const accessory = accessories[accessoryIndex];
  // Ensure likedBy array exists
  accessory.likedBy = accessory.likedBy || [];
  const userIndex = accessory.likedBy.indexOf(userId);

  if (userIndex > -1) {
    accessory.likedBy.splice(userIndex, 1); // Unlike
  } else {
    accessory.likedBy.push(userId); // Like
  }
  accessories[accessoryIndex] = { ...accessory };
  checkAndAwardBadges(userId); // Check for badges after liking/unliking
  return { likedBy: [...accessory.likedBy], likesCount: accessory.likedBy.length };
}

export function addCommentToAccessoryData(
  accessoryId: string,
  userId: string,
  userName: string,
  text: string,
  status: 'approved' | 'pending_review' | 'rejected' = 'approved'
): Comment | null {
  const accessoryIndex = accessories.findIndex(acc => acc.id === accessoryId);
  if (accessoryIndex === -1) {
    return null;
  }

  if (!Array.isArray(accessories[accessoryIndex].comments)) {
    accessories[accessoryIndex].comments = [];
  }

  const newComment: Comment = {
    id: `comment-${accessoryId}-${Date.now()}`,
    userId,
    userName,
    text,
    createdAt: new Date().toISOString(),
    status,
  };
  accessories[accessoryIndex].comments.push(newComment);
  accessories[accessoryIndex] = {
    ...accessories[accessoryIndex],
    comments: [...accessories[accessoryIndex].comments]
  };
  if (status === 'approved') { // Only award for approved comments
    checkAndAwardBadges(userId);
  }
  return newComment;
}


export function getUniqueCategories(): string[] {
  const categoriesSet = new Set<string>();
  accessories.forEach(acc => {
    if (acc.category) {
      categoriesSet.add(acc.category);
    }
  });
  return Array.from(categoriesSet).sort();
}

export function getDailyDeals(): Accessory[] {
  const deals = accessories.filter(acc => acc.isDeal);
  return deals.length > 0 ? deals : accessories.slice(0, 2).map(acc => ({
    ...acc,
  }));
}

export function getCoupons(): Coupon[] {
  return coupons;
}

export function getTestimonials(): Testimonial[] {
  return testimonials;
}

// --- Blog Post Data Functions ---
export function getAllPosts(): Post[] {
  return mockPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostById(id: string): Post | undefined {
  return mockPosts.find(post => post.id === id);
}

export function getPostBySlug(slug: string): Post | undefined {
  return mockPosts.find(post => post.slug === slug);
}

export function getLatestPosts(count: number): Post[] {
  return getAllPosts().slice(0, count);
}

export function addPost(postData: Omit<Post, 'id'>): Post {
  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...postData,
    publishedAt: postData.publishedAt && !isNaN(new Date(postData.publishedAt).getTime())
                   ? new Date(postData.publishedAt).toISOString()
                   : new Date().toISOString(),
    tags: postData.tags || [], 
    embedHtml: postData.embedHtml || '', // Ensure embedHtml is initialized
  };
  mockPosts.unshift(newPost); 
  return newPost;
}

export function updatePost(postId: string, postData: Partial<Omit<Post, 'id'>>): Post | null {
  const postIndex = mockPosts.findIndex(p => p.id === postId);
  if (postIndex === -1) {
    return null;
  }
  const updatedPost = {
    ...mockPosts[postIndex],
    ...postData,
    embedHtml: postData.embedHtml !== undefined ? postData.embedHtml : mockPosts[postIndex].embedHtml, // Handle embedHtml update
  };
  if (postData.publishedAt && !isNaN(new Date(postData.publishedAt).getTime())) {
    updatedPost.publishedAt = new Date(postData.publishedAt).toISOString();
  } else if (postData.publishedAt) { 
    updatedPost.publishedAt = mockPosts[postIndex].publishedAt;
  }

  mockPosts[postIndex] = updatedPost;
  return updatedPost;
}

export function deletePost(postId: string): boolean {
  const initialLength = mockPosts.length;
  mockPosts = mockPosts.filter(p => p.id !== postId);
  return mockPosts.length < initialLength;
}
// --- End Blog Post Data Functions ---


export function toggleFollowUser(currentUserId: string, targetUserId: string): { isFollowing: boolean; targetFollowersCount: number } | null {
  const currentUserIndex = mockUsers.findIndex(u => u.id === currentUserId);
  const targetUserIndex = mockUsers.findIndex(u => u.id === targetUserId);

  if (currentUserIndex === -1 || targetUserIndex === -1 || currentUserId === targetUserId) {
    return null;
  }

  const currentUser = mockUsers[currentUserIndex];
  const targetUser = mockUsers[targetUserIndex];

  currentUser.following = currentUser.following || [];
  currentUser.followers = currentUser.followers || [];
  targetUser.following = targetUser.following || [];
  targetUser.followers = targetUser.followers || [];

  const isCurrentlyFollowing = currentUser.following.includes(targetUserId);

  if (isCurrentlyFollowing) {
    currentUser.following = currentUser.following.filter(id => id !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
  } else {
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
  }

  mockUsers[currentUserIndex] = { ...currentUser };
  mockUsers[targetUserIndex] = { ...targetUser };

  // Check badges for both users after a follow/unfollow action
  checkAndAwardBadges(currentUserId);
  checkAndAwardBadges(targetUserId);

  return {
    isFollowing: !isCurrentlyFollowing,
    targetFollowersCount: targetUser.followers.length,
  };
}

// Badge Awarding Logic
export function checkAndAwardBadges(userId: string): void {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    console.warn(`User with ID ${userId} not found for badge checking.`);
    return;
  }

  let user = mockUsers[userIndex];
  // Ensure user.badges is an array
  user.badges = Array.isArray(user.badges) ? user.badges : [];

  const criteriaData = generateBadgeCriteriaData(user);
  let badgesUpdated = false;

  allBadges.forEach(badge => {
    if (!user.badges?.includes(badge.id) && badge.criteria(user, criteriaData)) {
      user.badges?.push(badge.id);
      badgesUpdated = true;
      console.log(`User ${user.name} awarded badge: ${badge.name}`);
    }
  });

  if (badgesUpdated) {
    mockUsers[userIndex] = { ...user, badges: [...(user.badges || [])] }; // Ensure a new reference for state updates if needed
  }
}

// Function to get all users (needed for some badge criteria or admin views)
export function getAllUsers(): User[] {
  return mockUsers.map(user => ({
    ...user,
    badges: user.badges || [],
  }));
}

// Function to toggle admin status for a user
export function toggleUserAdminStatus(userId: string): User | null {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    return null;
  }
  mockUsers[userIndex].isAdmin = !mockUsers[userIndex].isAdmin;
  // Create a new object reference for the updated user to help with state updates if necessary
  mockUsers[userIndex] = { ...mockUsers[userIndex] };
  return mockUsers[userIndex];
}

// --- Content Moderation Data Functions ---

export function getPendingComments(): PendingCommentDisplay[] {
  const pending: PendingCommentDisplay[] = [];
  accessories.forEach(acc => {
    (acc.comments || []).forEach(comment => {
      if (comment.status === 'pending_review') {
        pending.push({
          comment: { ...comment }, // Create a new object reference
          accessoryId: acc.id,
          accessoryName: acc.name,
        });
      }
    });
  });
  return pending.sort((a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime());
}

export function updateCommentStatus(
  accessoryId: string,
  commentId: string,
  newStatus: 'approved' | 'rejected'
): Comment | null {
  const accessoryIndex = accessories.findIndex(acc => acc.id === accessoryId);
  if (accessoryIndex === -1) {
    console.error(`Accessory with ID ${accessoryId} not found.`);
    return null;
  }

  const accessory = accessories[accessoryIndex];
  if (!accessory.comments) {
    console.error(`Accessory ${accessoryId} has no comments array.`);
    return null;
  }

  const commentIndex = accessory.comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) {
    console.error(`Comment with ID ${commentId} not found in accessory ${accessoryId}.`);
    return null;
  }

  // Update status
  accessory.comments[commentIndex].status = newStatus;
  const updatedComment = { ...accessory.comments[commentIndex] };

  // Ensure changes are reflected in the main 'accessories' array by creating new references
  const updatedComments = [...accessory.comments];
  updatedComments[commentIndex] = updatedComment;
  accessories[accessoryIndex] = { ...accessory, comments: updatedComments };

  if (newStatus === 'approved') {
    checkAndAwardBadges(updatedComment.userId);
  }
  
  console.log(`Comment ${commentId} in accessory ${accessoryId} status updated to ${newStatus}. User: ${updatedComment.userId}`);
  return updatedComment;
}

// --- Analytics Data Functions ---
export function getTotalUsersCount(): number {
  return mockUsers.length;
}

export function getTotalAccessoriesCount(): number {
  return accessories.length;
}

export function getTotalApprovedCommentsCount(): number {
  let count = 0;
  accessories.forEach(acc => {
    count += (acc.comments || []).filter(c => c.status === 'approved').length;
  });
  return count;
}

export function getAccessoriesPerCategory(): CategoryCount[] {
  const categoryMap: Record<string, number> = {};
  accessories.forEach(acc => {
    if (acc.category) {
      categoryMap[acc.category] = (categoryMap[acc.category] || 0) + 1;
    } else {
      categoryMap['Sem Categoria'] = (categoryMap['Sem Categoria'] || 0) + 1;
    }
  });
  return Object.entries(categoryMap).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count);
}

export function getMostLikedAccessories(limit: number = 5): TopAccessoryInfo[] {
  return [...accessories]
    .sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0))
    .slice(0, limit)
    .map(acc => ({
      id: acc.id,
      name: acc.name,
      count: acc.likedBy?.length || 0,
      imageUrl: acc.imageUrl
    }));
}

export function getMostCommentedAccessories(limit: number = 5): TopAccessoryInfo[] {
  return [...accessories]
    .map(acc => ({
      ...acc,
      approvedCommentsCount: (acc.comments || []).filter(c => c.status === 'approved').length
    }))
    .sort((a, b) => b.approvedCommentsCount - a.approvedCommentsCount)
    .slice(0, limit)
    .map(acc => ({
      id: acc.id,
      name: acc.name,
      count: acc.approvedCommentsCount,
      imageUrl: acc.imageUrl
    }));
}

export function getRecentComments(limit: number = 5): RecentCommentInfo[] {
  const allApprovedComments: RecentCommentInfo[] = [];
  accessories.forEach(acc => {
    (acc.comments || []).forEach(comment => {
      if (comment.status === 'approved') {
        allApprovedComments.push({
          ...comment,
          accessoryName: acc.name,
          accessoryId: acc.id,
        });
      }
    });
  });
  return allApprovedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  // Simulate async data fetching if needed, though current functions are sync
  return {
    totalUsers: getTotalUsersCount(),
    totalAccessories: getTotalAccessoriesCount(),
    totalApprovedComments: getTotalApprovedCommentsCount(),
    accessoriesPerCategory: getAccessoriesPerCategory(),
    mostLikedAccessories: getMostLikedAccessories(),
    mostCommentedAccessories: getMostCommentedAccessories(),
    recentComments: getRecentComments(),
  };
}

// --- Accessory Management Data Functions ---
export function addAccessory(accessoryData: Omit<Accessory, 'id' | 'likedBy' | 'comments' | 'isDeal'> & { isDeal?: boolean }): Accessory {
  const newAccessory: Accessory = {
    id: `acc-${Date.now()}`,
    name: accessoryData.name,
    imageUrl: accessoryData.imageUrl,
    imageHint: accessoryData.imageHint,
    shortDescription: accessoryData.shortDescription,
    fullDescription: accessoryData.fullDescription,
    affiliateLink: accessoryData.affiliateLink,
    price: accessoryData.price ? accessoryData.price.toString().replace(',', '.') : undefined,
    category: accessoryData.category,
    aiSummary: accessoryData.aiSummary,
    isDeal: accessoryData.isDeal ?? false,
    likedBy: [],
    comments: [],
    embedHtml: accessoryData.embedHtml, 
  };
  accessories.unshift(newAccessory);
  return newAccessory;
}

export function updateAccessory(accessoryId: string, accessoryData: Partial<Omit<Accessory, 'id' | 'likedBy' | 'comments'>>): Accessory | null {
  const accessoryIndex = accessories.findIndex(acc => acc.id === accessoryId);
  if (accessoryIndex === -1) {
    return null;
  }
  const updatedAccessoryData = { ...accessoryData };
  if (updatedAccessoryData.price) {
    updatedAccessoryData.price = updatedAccessoryData.price.toString().replace(',', '.');
  }

  accessories[accessoryIndex] = {
    ...accessories[accessoryIndex],
    ...updatedAccessoryData,
    embedHtml: accessoryData.embedHtml !== undefined ? accessoryData.embedHtml : accessories[accessoryIndex].embedHtml, // Manter o valor antigo se não fornecido
  };
  return accessories[accessoryIndex];
}

export function deleteAccessory(accessoryId: string): boolean {
  const initialLength = accessories.length;
  accessories = accessories.filter(acc => acc.id !== accessoryId);
  return accessories.length < initialLength;
}

