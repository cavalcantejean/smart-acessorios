
import type { Accessory, Coupon, Testimonial, User, Post } from './types';

const accessories: Accessory[] = [
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
    aiSummary: 'Bluetooth headphones with active noise cancellation, 30-hour playtime, and comfortable memory foam earcups for immersive audio.'
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
    aiSummary: 'A slim, durable silicone case offering drop/scratch protection, comfortable grip, and easy port access.'
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
    aiSummary: 'A compact 10000mAh power bank with dual USB ports and LED indicator for on-the-go charging.'
  },
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
    role: 'Cliente Satisfeita'
  },
  {
    id: 'testimonial2',
    name: 'Carlos Pereira',
    quote: 'Os cupons promocionais são ótimos! Consegui um bom desconto na minha última compra de fones de ouvido. O site é fácil de navegar.',
    role: 'Entusiasta de Gadgets'
  },
  {
    id: 'testimonial3',
    name: 'Juliana Costa',
    quote: 'Adoro a variedade de produtos e a clareza das descrições. A funcionalidade de favoritar é muito útil para salvar itens que quero comprar depois.',
    role: 'Compradora Online'
  }
];

const mockUsers: User[] = [
  { id: 'user-1', name: 'Usuário Comum', email: 'user@example.com', password: 'password123', isAdmin: false },
  { id: 'admin-1', name: 'Administrador', email: 'admin@example.com', password: 'adminpassword', isAdmin: true },
  { id: 'user-2', name: 'Outro Usuário', email: 'existing@example.com', password: 'password456', isAdmin: false },
];

const mockPosts: Post[] = [
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
    category: 'Guias',
    tags: ['USB-C', 'cabos', 'tecnologia', 'guias', 'power delivery'],
    publishedAt: '2024-07-22T09:15:00Z',
  }
];


export function getUserByEmail(email: string): User | undefined {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
}

export function addUser(user: User): boolean {
  if (getUserByEmail(user.email)) {
    return false; 
  }
  return true;
}

export function getAllAccessories(): Accessory[] {
  return accessories;
}

export function getAccessoryById(id: string): Accessory | undefined {
  return accessories.find(acc => acc.id === id);
}

export function getUniqueCategories(): string[] {
  const categories = new Set<string>();
  accessories.forEach(acc => {
    if (acc.category) {
      categories.add(acc.category);
    }
  });
  return Array.from(categories).sort();
}

export function getDailyDeals(): Accessory[] {
  const deals = accessories.filter(acc => acc.isDeal);
  return deals.length > 0 ? deals : accessories.slice(0, 2);
}

export function getCoupons(): Coupon[] {
  return coupons;
}

export function getTestimonials(): Testimonial[] {
  return testimonials;
}

// Blog/Post Functions
export function getAllPosts(): Post[] {
  return mockPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getPostBySlug(slug: string): Post | undefined {
  return mockPosts.find(post => post.slug === slug);
}

export function getLatestPosts(count: number): Post[] {
  return getAllPosts().slice(0, count);
}
