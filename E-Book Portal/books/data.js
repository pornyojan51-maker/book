// Default library books dataset for Lumina Books with Updated Categories
const DEFAULT_BOOKS = [
    {
        id: 'book-1',
        title: 'The Architecture of Silence',
        titleTh: 'สถาปัตยกรรมแห่งความเงียบ',
        author: 'Elias Thorne',
        category: 'ปรัชญา',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        coverGradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        description: 'การเดินทางสำรวจความเงียบในโลกที่วุ่นวาย ผ่านแนวคิดทางสถาปัตยกรรมและการค้นหาความสงบภายในจิตใจ บทบันทึกที่ผสมผสานปรัชญาและความงามของพื้นที่ว่าง',
        progress: 64,
        currentPage: 112,
        totalPages: 175,
        rating: 4.9,
        isFavorite: true,
        isReading: true,
        isCompleted: false,
        lastReadDate: '2026-08-07T10:30:00Z',
        chapters: [
            {
                title: 'บทที่ 1: จุดเริ่มต้นของความเงียบ (The Threshold of Quiet)',
                content: `
                    <h2>บทที่ 1: จุดเริ่มต้นของความเงียบ</h2>
                    <p class="lead">ในโลกที่เต็มไปด้วยมลภาวะทางเสียงและความเร่งรีบของการเมือง ความเงียบไม่ใช่เพียงแค่ความไร้เสียง หากแต่เป็นสเปซที่มีโครงสร้าง ตัวตน และจังหวะของมันเอง</p>
                    <p>เมื่อเราเดินเข้าไปในอาคารโบราณ สิ่งแรกที่สัมผัสผิวกายไม่ใช่โครงสร้างคอนกรีตหรือหินอ่อน แต่เป็นความเงียบสงบที่ตกตะกอนอยู่ตามมุมห้อง แสงแดดยามบ่ายที่ลอดผ่านหน้าต่างสูงทำให้ฝุ่นเม็ดเล็กๆ ลอยนิ่งในอากาศ ราวกับว่าเวลาได้หยุดหมุนลง ณ ที่แห่งนี้</p>
                    <p>สถาปนิกในยุคอดีตไม่ได้ออกแบบเพียงแค่ผนังและหลังคา แต่พวกเขายังออกแบบ "สเปซสำหรับความรู้สึก" การเว้นระยะห่างระหว่างเสาแต่ละต้น ความสูงของเพดาน และการเลือกใช้วัสดุที่ซับเสียง ทั้งหมดนี้คือภาษาซ่อนเร้นที่สื่อสารกับจิตใต้สำนึกของเรา</p>
                    <blockquote>"ความเงียบไม่ได้แปลว่าไม่มีอะไรอยู่ แต่หมายถึงทุกสิ่งอยู่ในสภาวะสมดุลที่สมบูรณ์แบบ" — Elias Thorne</blockquote>
                `
            },
            {
                title: 'บทที่ 2: พื้นที่ว่างและแสงเงา (Space & Shadow)',
                content: `
                    <h2>บทที่ 2: พื้นที่ว่างและแสงเงา</h2>
                    <p>แสงและเงาคือสองสิ่งที่ไม่เคยแยกขาดจากกัน ในทางสถาปัตยกรรม เงาไม่ใช่ความมืดมิดที่น่ากลัว หากแต่เป็นมิติที่ช่วยให้แสงมีคุณค่าและความหมาย</p>
                    <p>ลองจินตนาการถึงห้องสี่เหลี่ยมเรียบง่ายที่มีเพียงช่องแสงขนาดเล็กบนหลังคา เมื่อดวงอาทิตย์เคลื่อนผ่าน ทิศทางของลำแสงจะค่อยๆ ร่ายรำไปบนผนังเกิดเป็นมิติที่สงบเงียบ</p>
                `
            }
        ]
    },
    {
        id: 'book-2',
        title: 'Pride and Preconception in Siam',
        titleTh: 'บุพเพม่านหมอกแห่งสยาม',
        author: 'คุณหญิงกานดา',
        category: 'โรมานซ์อิงประวัติศาสตร์',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        coverGradient: 'linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%)',
        description: 'เรื่องราวความรักท่ามกลางฉากหลังประวัติศาสตร์รัตนโกสินทร์ตอนต้น การชิงไหวพริบของเรือนขุนนางและความรักที่ต้องฝ่าฟันมรสุมแห่งยุคสมัย',
        progress: 30,
        currentPage: 45,
        totalPages: 220,
        rating: 4.9,
        isFavorite: true,
        isReading: false,
        isCompleted: false,
        lastReadDate: '2026-08-05T14:15:00Z',
        chapters: [
            {
                title: 'บทที่ 1: รอยยิ้มใต้เงาจันทร์',
                content: `
                    <h2>บทที่ 1: รอยยิ้มใต้เงาจันทร์</h2>
                    <p class="lead">เสียงซออู้กังวานมาจากเรือนใหญ่ยามค่ำคืน หมอกบางๆ ปกคลุมแม่น้ำเจ้าพระยา</p>
                    <p>คุณหญิงกานดาเพ่งมองผ่านม่านไม้ไผ่ เห็นบุรุษหนุ่มในชุดราชพฤกษ์ก้าวขึ้นเรือนด้วยท่าทีสง่างาม สายตาของทั้งสองสบกันชั่วครู่ก่อนที่พัดใบเค้กจะถูกยกขึ้นบดบังใบหน้าเก้อเขิน...</p>
                `
            }
        ]
    },
    {
        id: 'book-3',
        title: 'The Great Romance Glitch',
        titleTh: 'เมื่อปัญญาประดิษฐ์สะดุดรัก',
        author: 'P. Arisara',
        category: 'คอมเมดี้โรแมนติก',
        coverUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
        coverGradient: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
        description: 'นิยายตลกฮาโรแมนติก เมื่ออัลกอริทึมจับคู่หาคู่จับเอาโปรแกรมเมอร์สายติสท์มาเจอกับวิศวกรหุ่นยนต์สุดเนี้ยบ ความวุ่นวายระดับอลเวงจึงเกิดขึ้น!',
        progress: 10,
        currentPage: 15,
        totalPages: 180,
        rating: 4.8,
        isFavorite: false,
        isReading: false,
        isCompleted: false,
        lastReadDate: null,
        chapters: [
            {
                title: 'บทที่ 1: บั๊กแรกแห่งหัวใจ',
                content: `
                    <h2>บทที่ 1: บั๊กแรกแห่งหัวใจ</h2>
                    <p class="lead">"ถ้า AI คำนวณว่าเราเข้ากันไม่ได้ 99.9% นั่นแปลว่ายังมีอีก 0.1% ที่เป็นปาฏิหาริย์ไม่ใช่เหรอ?"</p>
                    <p>กาแฟร้อนๆ หกใส่คีย์บอร์ดราคาแพงในวินาทีเดียวกับที่ข้อความจับคู่อัตโนมัติส่งเสียงเตือนดังลั่นห้องทำงาน...</p>
                `
            }
        ]
    },
    {
        id: 'book-4',
        title: 'Chronicles of the Old Dynasty',
        titleTh: 'พงศาวดารจักรวรรดิโลหะ',
        author: 'Dr. S. Vance',
        category: 'ประวัติศาสตร์',
        coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
        coverGradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        description: 'การวิเคราะห์เจาะลึกเหตุการณ์ประวัติศาสตร์การสร้างและล่มสลายของอารยธรรมโบราณ ยุทธศาสตร์สงครามและการเมืองในอดีต',
        progress: 100,
        currentPage: 250,
        totalPages: 250,
        rating: 5.0,
        isFavorite: true,
        isReading: false,
        isCompleted: true,
        lastReadDate: '2026-07-28T09:00:00Z',
        chapters: [
            {
                title: 'บทที่ 1: ยุคบุกเบิกและกำแพงหินแรก',
                content: `
                    <h2>บทที่ 1: ยุคบุกเบิกและกำแพงหินแรก</h2>
                    <p class="lead">จักรวรรดิไม่ได้ถูกสร้างขึ้นในวันเดียว แต่เกิดจากหยาดเหงื่อและยุทธศาสตร์อันเฉียบแหลมหลายร้อยปี</p>
                `
            }
        ]
    },
    {
        id: 'book-5',
        title: 'Whispers of the Eternal Forest',
        titleTh: 'ตำนานเงาวรรณกรรม',
        author: 'Isabel Thorne',
        category: 'วรรณกรรมคลาสสิก',
        coverUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
        coverGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        description: 'วรรณกรรมคลาสสิกชิ้นเอกระดับโลก ถ่ายทอดความงามของภาษา จิตวิญญาณของมนุษย์ และสัจธรรมแห่งการเวลา',
        progress: 45,
        currentPage: 90,
        totalPages: 200,
        rating: 4.8,
        isFavorite: false,
        isReading: true,
        isCompleted: false,
        lastReadDate: '2026-08-06T18:20:00Z',
        chapters: [
            {
                title: 'บทที่ 1: บทเพลงแห่งพงไพร',
                content: `
                    <h2>บทที่ 1: บทเพลงแห่งพงไพร</h2>
                    <p class="lead">ความงามของวรรณกรรมคือการได้ก้าวเข้าไปในจินตนาการของผู้เขียนอย่างลึกซึ้ง</p>
                `
            }
        ]
    },
    {
        id: 'book-6',
        title: 'Rose in the Mist',
        titleTh: 'กุหลาบในม่านหมอก',
        author: 'พิมลพรรณ',
        category: 'โรแมนติก',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        coverGradient: 'linear-gradient(135deg, #e55d87 0%, #5fc3e4 100%)',
        description: 'เรื่องราวความรักโรแมนติกละมุนหัวใจ ระหว่างดีไซเนอร์สาวกับเจ้าของฟาร์มดอกไม้บนดอยสูง',
        progress: 0,
        currentPage: 0,
        totalPages: 160,
        rating: 4.7,
        isFavorite: false,
        isReading: false,
        isCompleted: false,
        lastReadDate: null,
        chapters: [
            {
                title: 'บทที่ 1: กลิ่นหอมของเช้าวันใหม่',
                content: `
                    <h2>บทที่ 1: กลิ่นหอมของเช้าวันใหม่</h2>
                    <p class="lead">กุหลาบทุกดอกมีความลับ และหัวใจทุกดวงมีความรักที่ซ่อนอยู่</p>
                `
            }
        ]
    }
];
