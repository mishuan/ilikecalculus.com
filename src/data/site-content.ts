export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type PressItem = {
  outlet: string;
  title: string;
  url: string;
};

export type ProjectCategory = "portrait" | "personal";

export const categoryOrder: ProjectCategory[] = ["portrait", "personal"];

export const categoryLabels: Record<ProjectCategory, string> = {
  portrait: "portrait",
  personal: "personal",
};

export const siteData = {
  "site": {
    "name": "Michael Yuan | Photography",
    "shortName": "Michael Yuan",
    "tagline": "Photography",
    "instagramUrl": "https://instagram.com/ilikecalculus",
    "blogUrl": "https://ilikecalculus.substack.com/"
  },
  "about": {
    "title": "About",
    "paragraphs": [
      "Hey there, thanks for visiting! My name is Michael Yuan, and you're probably wondering - what's with the name \"ilikecalculus\"? Well, math has always been my favourite subject throughout school. 17-Year-old me thought calculus was the pinnacle of mathematics. Mostly because the equations looked hardcore, so I felt like Einstein was solving them. At the same time, I was playing a lot of video games and often struggled to come up with in-game names. Since I could never think of any witty names, I opted for dumb names - at least it beat being bland and generic. I needed something sufficiently unique that no one would ever think of. Thus, the name \"ilikecalculus\" was born one day when I was trying to come up with a new in-game handle, and my calculus homework happened to be open on my desk. Unsurprisingly, I never ran into issues with the name being claimed for any game.",
      "However, after pursuing a career in software engineering, I quickly realized calculus wasn't very useful for general software development. As such, calculus life is behind me now. Maybe I'll pick it up as a hobby sometime in the future.",
      "Currently, I'm a professional software engineer. Outside of work, I like to lift weights to keep my mind zen. Also, I take pictures sometimes.",
      "Feel free to reach out to me, I'd love to chat :)"
    ],
    "image": {
      "src": "/media/about/portrait.jpg",
      "width": 2500,
      "height": 3750,
      "alt": "About portrait"
    }
  },
  "contact": {
    "title": "Contact",
    "paragraphs": [
      "I am a visual artist working in the medium of photography. I am motivated by challenging common perspectives of our world. Through photography, I shrink, flatten, and contort the objects of our civilization to draw out the subtle presence of humanity and its relationship with the world. I am drawn to the quiet solitude and memories of places, things, and people that have become more invisible after shifts in time and culture.",
      "Looking to collaborate? Got questions? Got suggestions? Or just want to say hi? Shoot me a message, I'd love to hear from you! Don't spam me, though."
    ],
    "image": {
      "src": "/media/contact/banner.jpg",
      "width": 2500,
      "height": 833,
      "alt": "Contact portrait"
    }
  },
  "press": [
    {
      "outlet": "Leica Blog",
      "title": "Michael Yuan: The Bridge",
      "url": "https://lfi-online.de/ceemes/en/blog/michael-yuan-the-bridge-2693.html"
    },
    {
      "outlet": "SFGate",
      "title": "See the Golden Gate Bridge like you never have before",
      "url": "https://www.sfgate.com/living/article/Golden-Gate-Bridge-photographer-Michael-Yuan-15668793.php"
    },
    {
      "outlet": "PetaPixel",
      "title": "The Bridge, Reconstructed: A Different Perspective of the Golden Gate Bridge",
      "url": "https://petapixel.com/2020/10/05/the-bridge-reconstructed-a-different-perspective-of-the-golden-gate-bridge/"
    },
    {
      "outlet": "LifeFramer",
      "title": "Reimagining an Icon",
      "url": "https://www.life-framer.com/michael-yuan/"
    },
    {
      "outlet": "Artwort",
      "title": "The Bridge, Reconstructed – Il Golden Gate Bridge da ricostruire nelle fotografie di Michael Yuan",
      "url": "https://www.artwort.com/2020/11/03/fotografia/the-bridge-reconstructed-michael-yuan/"
    },
    {
      "outlet": "Plain Magazine",
      "title": "The Golden Gate Bridge, Deconstructed and Delightfully Unrecognizable",
      "url": "https://plainmagazine.com/michael-yuan-golden-gate-bridge/"
    },
    {
      "outlet": "Architectural Photography Almanac",
      "title": "Math Aficionado Michael Yuan Hones in on the Golden Ratios of the Golden Gate Bridge",
      "url": "https://apalmanac.com/potw/math-aficionado-michael-yuan-hones-in-on-the-golden-ratios-of-the-golden-gate-bridge-13773"
    },
    {
      "outlet": "Dodho Magazine",
      "title": "Golden Gate; The Bridge, Reconstructed by Michael Yuan",
      "url": "https://www.dodho.com/golden-gate-the-bridge-reconstructed-by-michael-yuan/"
    },
    {
      "outlet": "The Photo Argus",
      "title": "Incredible Pictures of Basketball Courts – “Urban Courts” by Michael Yuan",
      "url": "https://www.thephotoargus.com/incredible-pictures-of-basketball-courts-urban-courts-by-michael-yuan/"
    },
    {
      "outlet": "Le Blog de Fabien Ribery",
      "title": "The Bridge, l’âme du métal, par Michael Yuan, ingénieur photographe",
      "url": "https://lintervalle.blog/2022/08/03/the-bridge-lame-du-metal-par-michael-yuan-ingenieur-photographe/"
    },
    {
      "outlet": "Glasstire",
      "title": "A Shockingly Modernist Project and Others: Four Books of Photographs",
      "url": "https://glasstire.com/2023/01/04/a-shockingly-modernist-project-and-others-four-books-of-photographs/"
    }
  ],
  "projects": [
    {
      "slug": "the-bridge-reconstructed",
      "categories": ["personal"],
      "title": "The Bridge, Reconstructed",
      "description": "A new perspective on an iconic subject.",
      "coverImage": {
        "src": "/media/projects/the-bridge-reconstructed/01.jpg",
        "width": 2500,
        "height": 3750,
        "alt": "The Bridge, Reconstructed"
      },
      "images": [
        {
          "src": "/media/projects/the-bridge-reconstructed/01.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20180217-DSCF1489.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/02.jpg",
          "width": 2500,
          "height": 3749,
          "alt": "20190210-DSCF7837-Edit.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/03.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "20190901-DSCF4044.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/04.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20190901-DSCF3823.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/05.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20200501-DSCF1365.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/06.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20190210-DSCF8005-Edit.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/07.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20191005-DSCF4589.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/08.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20191005-DSCF4605.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/09.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20190513-DSCF1492.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/10.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20191005-DSCF4685.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/11.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20200617-DSCF1967.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/12.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "20200501-DSCF1379.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/13.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20200501-DSCF1370.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/14.jpg",
          "width": 2000,
          "height": 4000,
          "alt": "20191005-DSCF4669.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/15.jpg",
          "width": 2500,
          "height": 1250,
          "alt": "20191005-DSCF4665.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/16.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20190210-DSCF7769.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/17.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20190210-DSCF7957.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/18.jpg",
          "width": 2500,
          "height": 1786,
          "alt": "20200119-DSCF8049.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/19.jpg",
          "width": 2500,
          "height": 1786,
          "alt": "20191005-DSCF4632.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/20.jpg",
          "width": 2000,
          "height": 3000,
          "alt": "20200704-DSCF2203.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/21.jpg",
          "width": 2000,
          "height": 3000,
          "alt": "20200704-DSCF2215.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/22.jpg",
          "width": 2500,
          "height": 3749,
          "alt": "20200704-DSCF2235.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/23.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20190210-DSCF7719-Edit.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/24.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20190210-DSCF7732.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/25.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20190210-DSCF7737.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/26.jpg",
          "width": 2000,
          "height": 2800,
          "alt": "20200704-DSCF2241.jpg"
        },
        {
          "src": "/media/projects/the-bridge-reconstructed/27.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20190210-DSCF7872.jpg"
        }
      ]
    },
    {
      "slug": "urban-courts",
      "categories": ["personal"],
      "title": "Urban Courts",
      "description": "Basketball courts across the world.",
      "coverImage": {
        "src": "/media/projects/urban-courts/01.jpg",
        "width": 2500,
        "height": 3750,
        "alt": "Urban Courts"
      },
      "images": [
        {
          "src": "/media/projects/urban-courts/01.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20180913-DSCF2564.jpg"
        },
        {
          "src": "/media/projects/urban-courts/02.jpg",
          "width": 2250,
          "height": 4000,
          "alt": "20181012-DSCF2991.jpg"
        },
        {
          "src": "/media/projects/urban-courts/03.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "20181013-DSCF3350.jpg"
        },
        {
          "src": "/media/projects/urban-courts/04.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20191103-DSCF6314.jpg"
        },
        {
          "src": "/media/projects/urban-courts/05.jpg",
          "width": 2500,
          "height": 1250,
          "alt": "20191103-DSCF6326.jpg"
        },
        {
          "src": "/media/projects/urban-courts/06.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20191103-DSCF6332.jpg"
        },
        {
          "src": "/media/projects/urban-courts/07.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20191103-DSCF6340.jpg"
        },
        {
          "src": "/media/projects/urban-courts/08.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20200208-DSCF8732.jpg"
        },
        {
          "src": "/media/projects/urban-courts/09.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20200220-DSCF0198.jpg"
        },
        {
          "src": "/media/projects/urban-courts/10.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20200523-DSCF1742.jpg"
        },
        {
          "src": "/media/projects/urban-courts/11.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20200617-DSCF1974.jpg"
        },
        {
          "src": "/media/projects/urban-courts/12.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "20200617-DSCF1975.jpg"
        },
        {
          "src": "/media/projects/urban-courts/13.jpg",
          "width": 2500,
          "height": 2000,
          "alt": "20200628-DSCF2055.jpg"
        },
        {
          "src": "/media/projects/urban-courts/14.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20190331-DSCF0428.jpg"
        },
        {
          "src": "/media/projects/urban-courts/15.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20190331-DSCF0406.jpg"
        },
        {
          "src": "/media/projects/urban-courts/16.jpg",
          "width": 2500,
          "height": 2000,
          "alt": "20201201-DSCF3702.jpg"
        },
        {
          "src": "/media/projects/urban-courts/17.jpg",
          "width": 2143,
          "height": 3000,
          "alt": "20210809-DSCF5285.jpg"
        },
        {
          "src": "/media/projects/urban-courts/18.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "20210809-DSCF5287.jpg"
        },
        {
          "src": "/media/projects/urban-courts/19.jpg",
          "width": 2000,
          "height": 3000,
          "alt": "20210724-DSCF5036.jpg"
        },
        {
          "src": "/media/projects/urban-courts/20.jpg",
          "width": 2400,
          "height": 3000,
          "alt": "20210724-DSCF5005.jpg"
        },
        {
          "src": "/media/projects/urban-courts/21.jpg",
          "width": 2000,
          "height": 3000,
          "alt": "20220918-DSCF1571.jpg"
        },
        {
          "src": "/media/projects/urban-courts/22.jpg",
          "width": 2250,
          "height": 2813,
          "alt": "20220918-DSCF1569.jpg"
        },
        {
          "src": "/media/projects/urban-courts/23.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20211023-DSCF6373.jpg"
        },
        {
          "src": "/media/projects/urban-courts/24.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20211019-DSCF6302.jpg"
        },
        {
          "src": "/media/projects/urban-courts/25.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20211019-DSCF6276.jpg"
        },
        {
          "src": "/media/projects/urban-courts/26.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20211019-DSCF6233.jpg"
        },
        {
          "src": "/media/projects/urban-courts/27.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20211019-DSCF6298.jpg"
        },
        {
          "src": "/media/projects/urban-courts/28.jpg",
          "width": 2500,
          "height": 4444,
          "alt": "20211019-DSCF6263.jpg"
        },
        {
          "src": "/media/projects/urban-courts/29.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20211019-DSCF6300.jpg"
        },
        {
          "src": "/media/projects/urban-courts/30.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230403-DSCF1566 2.jpg"
        },
        {
          "src": "/media/projects/urban-courts/31.jpg",
          "width": 2500,
          "height": 3333,
          "alt": "20220820-DSCF0126.jpg"
        },
        {
          "src": "/media/projects/urban-courts/32.jpg",
          "width": 2000,
          "height": 3000,
          "alt": "20221115-DSCF2192.jpg"
        },
        {
          "src": "/media/projects/urban-courts/33.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20221115-DSCF2189.jpg"
        },
        {
          "src": "/media/projects/urban-courts/34.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20221115-DSCF2188.jpg"
        },
        {
          "src": "/media/projects/urban-courts/35.jpg",
          "width": 2250,
          "height": 2813,
          "alt": "20220918-DSCF1569.jpg"
        }
      ]
    },
    {
      "slug": "desolate-sands",
      "categories": ["personal"],
      "title": "Desolate Sands",
      "description": "A look into the empty resorts in Cuba during slow seasons.",
      "coverImage": {
        "src": "/media/projects/desolate-sands/01.jpg",
        "width": 2500,
        "height": 1406,
        "alt": "Desolate Sands"
      },
      "images": [
        {
          "src": "/media/projects/desolate-sands/01.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "The Roaming Dog"
        },
        {
          "src": "/media/projects/desolate-sands/02.jpg",
          "width": 2500,
          "height": 2500,
          "alt": "Three Outdoor Showers (Wet)"
        },
        {
          "src": "/media/projects/desolate-sands/03.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "The Empty Hotel"
        },
        {
          "src": "/media/projects/desolate-sands/04.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "Highway Palm Tree"
        },
        {
          "src": "/media/projects/desolate-sands/05.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "The Tumbling Donut"
        },
        {
          "src": "/media/projects/desolate-sands/06.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "The President Suite"
        },
        {
          "src": "/media/projects/desolate-sands/07.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "Stranded Boats"
        },
        {
          "src": "/media/projects/desolate-sands/08.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "Off Duty"
        },
        {
          "src": "/media/projects/desolate-sands/09.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "Off Duty"
        },
        {
          "src": "/media/projects/desolate-sands/10.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "Garbage Can and Tiki Umbrella"
        },
        {
          "src": "/media/projects/desolate-sands/11.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "Eighteen Tiki Umbrellas "
        },
        {
          "src": "/media/projects/desolate-sands/12.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "Opposite Directions"
        },
        {
          "src": "/media/projects/desolate-sands/13.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "A Single Wave"
        },
        {
          "src": "/media/projects/desolate-sands/14.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "The Escape"
        }
      ]
    },
    {
      "slug": "portraits",
      "categories": ["portrait"],
      "title": "Portraits",
      "description": "A selection of portraits, in and out of studios.",
      "coverImage": {
        "src": "/media/projects/portraits/01.jpg",
        "width": 2500,
        "height": 3125,
        "alt": "Portraits"
      },
      "images": [
        {
          "src": "/media/projects/portraits/01.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20200321-DSCF0968.jpg"
        },
        {
          "src": "/media/projects/portraits/02.jpg",
          "width": 2500,
          "height": 2000,
          "alt": "20200321-DSCF0969.jpg"
        },
        {
          "src": "/media/projects/portraits/03.jpg",
          "width": 2500,
          "height": 1064,
          "alt": "20200321-DSCF0937.jpg"
        },
        {
          "src": "/media/projects/portraits/04.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "20200410-DSCF1132.jpg"
        },
        {
          "src": "/media/projects/portraits/05.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20200410-DSCF1118.jpg"
        },
        {
          "src": "/media/projects/portraits/06.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20200410-DSCF1126.jpg"
        },
        {
          "src": "/media/projects/portraits/07.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20200318-DSCF0823.jpg"
        },
        {
          "src": "/media/projects/portraits/08.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20190928-DSCF4373.jpg"
        },
        {
          "src": "/media/projects/portraits/09.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20200318-DSCF0855.jpg"
        },
        {
          "src": "/media/projects/portraits/10.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20200321-DSCF0989.jpg"
        },
        {
          "src": "/media/projects/portraits/11.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20200321-DSCF0982.jpg"
        },
        {
          "src": "/media/projects/portraits/12.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20200321-DSCF0985.jpg"
        },
        {
          "src": "/media/projects/portraits/13.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230809-DSCF3675.jpg"
        },
        {
          "src": "/media/projects/portraits/14.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230808-DSCF3426.jpg"
        },
        {
          "src": "/media/projects/portraits/15.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230810-DSCF4002.jpg"
        },
        {
          "src": "/media/projects/portraits/16.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230913-FUJIFILM X-T5 7728x5152_003418.jpg"
        },
        {
          "src": "/media/projects/portraits/17.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230913-DSCF3388.jpg"
        },
        {
          "src": "/media/projects/portraits/18.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20190511-DSCF1309.jpg"
        },
        {
          "src": "/media/projects/portraits/19.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230930-DSCF3547.jpg"
        },
        {
          "src": "/media/projects/portraits/20.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230930-DSCF3530.jpg"
        },
        {
          "src": "/media/projects/portraits/21.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230930-DSCF4861.jpg"
        },
        {
          "src": "/media/projects/portraits/22.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20231002-DSCF5345.jpg"
        },
        {
          "src": "/media/projects/portraits/23.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230930-DSCF4831.jpg"
        },
        {
          "src": "/media/projects/portraits/24.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230811-DSCF4084-2.jpg"
        }
      ]
    },
    {
      "slug": "dustin",
      "categories": ["portrait"],
      "title": "Dustin",
      "description": "",
      "coverImage": {
        "src": "/media/projects/dustin/01.jpg",
        "width": 2500,
        "height": 3750,
        "alt": "20210508-DSCF4205.jpg"
      },
      "images": [
        {
          "src": "/media/projects/dustin/01.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20210508-DSCF4205.jpg"
        },
        {
          "src": "/media/projects/dustin/02.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20210508-DSCF4188.jpg"
        },
        {
          "src": "/media/projects/dustin/03.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "20210508-DSCF4191.jpg"
        },
        {
          "src": "/media/projects/dustin/04.jpg",
          "width": 2500,
          "height": 1406,
          "alt": "20210508-DSCF4154.jpg"
        },
        {
          "src": "/media/projects/dustin/05.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20210508-DSCF4138.jpg"
        },
        {
          "src": "/media/projects/dustin/06.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20210508-DSCF4106.jpg"
        },
        {
          "src": "/media/projects/dustin/07.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20210508-DSCF4327.jpg"
        },
        {
          "src": "/media/projects/dustin/08.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20210508-DSCF4264.jpg"
        },
        {
          "src": "/media/projects/dustin/09.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20210508-DSCF4257.jpg"
        }
      ]
    },
    {
      "slug": "figma",
      "categories": ["portrait"],
      "title": "Figma 2022",
      "description": "",
      "coverImage": {
        "src": "/media/projects/figma/01.jpg",
        "width": 2500,
        "height": 3750,
        "alt": "20220608-DSCF7438.jpg"
      },
      "images": [
        {
          "src": "/media/projects/figma/01.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220608-DSCF7438.jpg"
        },
        {
          "src": "/media/projects/figma/02.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220608-DSCF7431.jpg"
        },
        {
          "src": "/media/projects/figma/03.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20220607-DSCF6776.jpg"
        },
        {
          "src": "/media/projects/figma/04.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220607-DSCF7109.jpg"
        },
        {
          "src": "/media/projects/figma/05.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220607-DSCF6933.jpg"
        },
        {
          "src": "/media/projects/figma/06.jpg",
          "width": 2500,
          "height": 3125,
          "alt": "20220607-DSCF6879.jpg"
        },
        {
          "src": "/media/projects/figma/07.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220607-DSCF6903.jpg"
        },
        {
          "src": "/media/projects/figma/08.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220714-DSCF7875.jpg"
        },
        {
          "src": "/media/projects/figma/09.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220607-DSCF6798.jpg"
        },
        {
          "src": "/media/projects/figma/10.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220607-DSCF6725.jpg"
        },
        {
          "src": "/media/projects/figma/11.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220607-DSCF6917.jpg"
        },
        {
          "src": "/media/projects/figma/12.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220607-DSCF6936.jpg"
        },
        {
          "src": "/media/projects/figma/13.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220607-DSCF7115.jpg"
        },
        {
          "src": "/media/projects/figma/14.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20220607-DSCF7150.jpg"
        },
        {
          "src": "/media/projects/figma/15.jpg",
          "width": 2500,
          "height": 1667,
          "alt": "20220608-DSCF7458.jpg"
        }
      ]
    },
    {
      "slug": "figma-2023",
      "categories": ["portrait"],
      "title": "Figma 2023",
      "description": "",
      "coverImage": {
        "src": "/media/projects/figma-2023/01.jpg",
        "width": 2500,
        "height": 3750,
        "alt": "20230808-DSCF3302.jpg"
      },
      "images": [
        {
          "src": "/media/projects/figma-2023/01.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230808-DSCF3302.jpg"
        },
        {
          "src": "/media/projects/figma-2023/02.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230808-DSCF3419.jpg"
        },
        {
          "src": "/media/projects/figma-2023/03.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230809-DSCF3650.jpg"
        },
        {
          "src": "/media/projects/figma-2023/04.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230726-DSCF2482.jpg"
        },
        {
          "src": "/media/projects/figma-2023/05.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230726-DSCF2619.jpg"
        },
        {
          "src": "/media/projects/figma-2023/06.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230809-DSCF3637.jpg"
        },
        {
          "src": "/media/projects/figma-2023/07.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230809-DSCF3540.jpg"
        },
        {
          "src": "/media/projects/figma-2023/08.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230726-DSCF2565.jpg"
        },
        {
          "src": "/media/projects/figma-2023/09.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230726-DSCF2424.jpg"
        },
        {
          "src": "/media/projects/figma-2023/10.jpg",
          "width": 2500,
          "height": 3750,
          "alt": "20230726-DSCF2519.jpg"
        }
      ]
    }
  ],
  "featuredProjectSlugs": [
    "the-bridge-reconstructed",
    "portraits",
    "desolate-sands",
    "urban-courts"
  ]
} as const;

export type Project = (typeof siteData.projects)[number];
export type ProjectSlug = Project["slug"];

export const projects = [...siteData.projects];

export const projectsBySlug: Record<string, Project> = Object.fromEntries(
  projects.map((project) => [project.slug, project]),
) as Record<string, Project>;

export const projectsByCategoryAndSlug: Record<string, Project> = Object.fromEntries(
  projects.flatMap((project) =>
    project.categories.map((category) => [`${category}/${project.slug}`, project] as const),
  ),
) as Record<string, Project>;

export const groupedProjects = categoryOrder.map((category) => ({
  category,
  label: categoryLabels[category],
  projects: projects.filter((project) => project.categories.some((item) => item === category)),
}));

export const featuredProjects = siteData.featuredProjectSlugs
  .map((slug) => projectsBySlug[slug])
  .filter(Boolean);

export function projectHref(project: Project, preferredCategory?: ProjectCategory) {
  const category =
    preferredCategory && project.categories.some((item) => item === preferredCategory)
      ? preferredCategory
      : project.categories[0];

  return `/works/${category}/${project.slug}`;
}

export const navItems = [
  { label: "home", href: "/" },
  { label: "projects", href: "/works" },
  { label: "about", href: "/about" },
  { label: "blog", href: "/blog" },
  { label: "contact", href: "/contact" },
  { label: "press", href: "/press" },
] as const;
