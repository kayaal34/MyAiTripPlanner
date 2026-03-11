/**
 * Ücretsiz Kullanıcılara Sunulan Popüler Şehirler
 * Premium şehirler backend'de saklanır ve asla frontend'e gönderilmez
 */

export interface City {
    id: string;
    name: string;
    country: string;
    description: string;
    imageUrl: string;
    topAttractions: string[];
}

export const freeCities: City[] = [
    {
        id: 'paris',
        name: 'Paris',
        country: 'France',
        description: 'Aşk şehri Paris, görkemli Eyfel Kulesi, dünya çapında sanat müzeleri ve romantik Seine nehri kıyılarıyla ziyaretçilerini büyülüyor.',
        imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
        topAttractions: [
            'Eyfel Kulesi',
            'Louvre Müzesi',
            'Notre-Dame Katedrali'
        ]
    },
    {
        id: 'rome',
        name: 'Roma',
        country: 'Italy',
        description: 'Antik Roma İmparatorluğu\'nun kalbi. Kolezyum, Vatikan ve tarihin her köşesinde kendini gösteren ihtişamıyla eşsiz bir deneyim.',
        imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
        topAttractions: [
            'Kolezyum',
            'Vatikan Müzesi',
            'Trevi Çeşmesi'
        ]
    },
    {
        id: 'tokyo',
        name: 'Tokyo',
        country: 'Japan',
        description: 'Geleneksel tapınaklar ile neon ışıklı gökdelenlerin bir arada olduğu, modern ve antik kültürün mükemmel uyumunu sunan şehir.',
        imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
        topAttractions: [
            'Senso-ji Tapınağı',
            'Tokyo Tower',
            'Shibuya Kavşağı'
        ]
    },
    {
        id: 'newyork',
        name: 'New York',
        country: 'USA',
        description: 'Uyumayan şehir! Broadway gösterileri, ikonik Central Park, Özgürlük Heykeli ve dünyanın en kozmopolit atmosferiyle hayat dolu.',
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
        topAttractions: [
            'Özgürlük Heykeli',
            'Times Square',
            'Central Park'
        ]
    },
    {
        id: 'istanbul',
        name: 'İstanbul',
        country: 'Turkey',
        description: 'İki kıtayı birleştiren büyülü şehir. Tarihi yarımada, Boğaz manzarası, Osmanlı mimarisi ve lezzetli Türk mutfağıyla unutulmaz anılar.',
        imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
        topAttractions: [
            'Ayasofya',
            'Topkapı Sarayı',
            'Kapalıçarşı'
        ]
    }
];
