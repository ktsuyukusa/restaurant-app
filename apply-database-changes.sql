-- Apply Updated Database Schema with 11-Language Support
-- Run this in your Supabase SQL Editor

-- First, let's check if the multilingual columns exist
DO $$
BEGIN
    -- Add multilingual columns to restaurants table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'name_multilingual') THEN
        ALTER TABLE restaurants ADD COLUMN name_multilingual JSONB;
        RAISE NOTICE 'Added name_multilingual column to restaurants table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'address_multilingual') THEN
        ALTER TABLE restaurants ADD COLUMN address_multilingual JSONB;
        RAISE NOTICE 'Added address_multilingual column to restaurants table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'restaurants' AND column_name = 'description_multilingual') THEN
        ALTER TABLE restaurants ADD COLUMN description_multilingual JSONB;
        RAISE NOTICE 'Added description_multilingual column to restaurants table';
    END IF;
    
    -- Add multilingual columns to menus table if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menus' AND column_name = 'name_multilingual') THEN
        ALTER TABLE menus ADD COLUMN name_multilingual JSONB;
        RAISE NOTICE 'Added name_multilingual column to menus table';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menus' AND column_name = 'description_multilingual') THEN
        ALTER TABLE menus ADD COLUMN description_multilingual JSONB;
        RAISE NOTICE 'Added description_multilingual column to menus table';
    END IF;
END $$;

-- Update existing restaurant data with 11-language support
UPDATE restaurants 
SET 
    name_multilingual = '{"en": "AZ Dining Saku", "ja": "AZ DINING 佐久店", "zh": "AZ餐厅佐久", "ko": "AZ 다이닝 사쿠", "pl": "AZ Dining Saku", "ms": "AZ Dining Saku", "id": "AZ Dining Saku", "th": "AZ Dining Saku", "vi": "AZ Dining Saku", "es": "AZ Dining Saku", "ro": "AZ Dining Saku"}',
    address_multilingual = '{"en": "741 Iwamurata, Saku, Nagano Prefecture 385-0022", "ja": "〒385-0022 長野県佐久市岩村田741", "zh": "〒385-0022 长野县佐久市岩村田741", "ko": "〒385-0022 나가노현 사쿠시 이와무라타 741", "pl": "741 Iwamurata, Saku, Prefektura Nagano 385-0022", "ms": "741 Iwamurata, Saku, Prefektur Nagano 385-0022", "id": "741 Iwamurata, Saku, Prefektur Nagano 385-0022", "th": "741 Iwamurata, Saku, จังหวัดนากาโนะ 385-0022", "vi": "741 Iwamurata, Saku, Tỉnh Nagano 385-0022", "es": "741 Iwamurata, Saku, Prefectura de Nagano 385-0022", "ro": "741 Iwamurata, Saku, Prefectura Nagano 385-0022"}',
    description_multilingual = '{"en": "Authentic Italian spaghetteria specializing in pasta dishes", "ja": "本格的なイタリアンスパゲッテリア", "zh": "正宗意大利面食店", "ko": "정통 이탈리안 스파게테리아", "pl": "Autentyczna włoska spaghetteria", "ms": "Spaghetteria Itali asli", "id": "Spaghetteria Italia otentik", "th": "สปาเก็ตเตอเรียอิตาลีแท้", "vi": "Spaghetteria Ý chính gốc", "es": "Spaghetteria italiana auténtica", "ro": "Spaghetteria italiană autentică"}'
WHERE name = 'AZ Dining Saku';

UPDATE restaurants 
SET 
    name_multilingual = '{"en": "Sakura Sushi", "ja": "桜寿司", "zh": "樱花寿司", "ko": "사쿠라 스시", "pl": "Sakura Sushi", "ms": "Sakura Sushi", "id": "Sakura Sushi", "th": "ซากุระ ซูชิ", "vi": "Sakura Sushi", "es": "Sakura Sushi", "ro": "Sakura Sushi"}',
    address_multilingual = '{"en": "456 Cherry Blossom Ave, Saku", "ja": "佐久市桜通り456", "zh": "佐久市樱花大道456", "ko": "사쿠시 벚꽃거리 456", "pl": "456 Aleja Wiśniowych Kwiatów, Saku", "ms": "456 Lebuh Bunga Sakura, Saku", "id": "456 Jalan Bunga Sakura, Saku", "th": "456 ถนนดอกซากุระ, ซากุ", "vi": "456 Đại lộ Hoa Anh đào, Saku", "es": "456 Avenida de las Flores de Cerezo, Saku", "ro": "456 Aleea Floarelor de Cireș, Saku"}',
    description_multilingual = '{"en": "Fresh sushi and traditional Japanese dishes", "ja": "新鮮な寿司と伝統的な日本料理", "zh": "新鲜寿司和传统日本料理", "ko": "신선한 스시와 전통 일본 요리", "pl": "Świeże sushi i tradycyjne dania japońskie", "ms": "Sushi segar dan hidangan Jepun tradisional", "id": "Sushi segar dan hidangan Jepang tradisional", "th": "ซูชิสดและอาหารญี่ปุ่นดั้งเดิม", "vi": "Sushi tươi và món ăn Nhật truyền thống", "es": "Sushi fresco y platos japoneses tradicionales", "ro": "Sushi proaspăt și feluri de mâncare japoneze tradiționale"}'
WHERE name = 'Sakura Sushi';

UPDATE restaurants 
SET 
    name_multilingual = '{"en": "Café Europa", "ja": "カフェ・ヨーロッパ", "zh": "欧洲咖啡厅", "ko": "카페 유럽", "pl": "Café Europa", "ms": "Café Europa", "id": "Café Europa", "th": "คาเฟ่ ยุโรป", "vi": "Café Europa", "es": "Café Europa", "ro": "Café Europa"}',
    address_multilingual = '{"en": "789 European Plaza, Saku", "ja": "佐久市ヨーロッパ広場789", "zh": "佐久市欧洲广场789", "ko": "사쿠시 유럽광장 789", "pl": "789 Europejski Plac, Saku", "ms": "789 Dataran Eropah, Saku", "id": "789 Plaza Eropa, Saku", "th": "789 จัตุรัสยุโรป, ซากุ", "vi": "789 Quảng trường Châu Âu, Saku", "es": "789 Plaza Europea, Saku", "ro": "789 Piața Europeană, Saku"}',
    description_multilingual = '{"en": "European-style café with pastries and coffee", "ja": "ヨーロッパ風カフェ、ペイストリーとコーヒー", "zh": "欧式咖啡厅，提供糕点和咖啡", "ko": "유럽풍 카페, 페이스트리와 커피", "pl": "Kawiarnia w stylu europejskim z ciastkami i kawą", "ms": "Kafe gaya Eropah dengan pastri dan kopi", "id": "Kafe bergaya Eropa dengan pastry dan kopi", "th": "คาเฟ่สไตล์ยุโรปพร้อมขนมอบและกาแฟ", "vi": "Quán cà phê kiểu châu Âu với bánh ngọt và cà phê", "es": "Café de estilo europeo con pastelería y café", "ro": "Cafenea în stil european cu patiserie și cafea"}'
WHERE name = 'Café Europa';

-- Update existing menu items with 11-language support
UPDATE menus 
SET 
    name_multilingual = '{"en": "Carbonara", "ja": "カルボナーラ", "zh": "卡邦尼拉", "ko": "카르보나라", "pl": "Carbonara", "ms": "Carbonara", "id": "Carbonara", "th": "คาร์โบนารา", "vi": "Carbonara", "es": "Carbonara", "ro": "Carbonara"}',
    description_multilingual = '{"en": "Classic Italian pasta with eggs, cheese, and pancetta", "ja": "卵、チーズ、パンチェッタを使った本格的なイタリアンパスタ", "zh": "使用鸡蛋、奶酪和意式培根的经典意大利面", "ko": "계란, 치즈, 판체타를 사용한 정통 이탈리안 파스타", "pl": "Klasyczny włoski makaron z jajkami, serem i pancettą", "ms": "Pasta Itali klasik dengan telur, keju dan pancetta", "id": "Pasta Italia klasik dengan telur, keju dan pancetta", "th": "พาสต้าอิตาลีคลาสสิกกับไข่ ชีส และแพนเชตต้า", "vi": "Mì Ý cổ điển với trứng, phô mai và pancetta", "es": "Pasta italiana clásica con huevos, queso y panceta", "ro": "Paste italiene clasice cu ouă, brânză și pancetta"}'
WHERE name = 'Carbonara';

UPDATE menus 
SET 
    name_multilingual = '{"en": "Margherita Pizza", "ja": "マルゲリータピザ", "zh": "玛格丽特披萨", "ko": "마르게리타 피자", "pl": "Pizza Margherita", "ms": "Pizza Margherita", "id": "Pizza Margherita", "th": "พิซซ่ามาร์เกอริต้า", "vi": "Pizza Margherita", "es": "Pizza Margherita", "ro": "Pizza Margherita"}',
    description_multilingual = '{"en": "Traditional pizza with tomato and mozzarella", "ja": "トマトとモッツァレラの伝統的なピザ", "zh": "使用番茄和马苏里拉奶酪的传统披萨", "ko": "토마토와 모짜렐라를 사용한 전통 피자", "pl": "Tradycyjna pizza z pomidorami i mozzarellą", "ms": "Pizza tradisional dengan tomato dan mozzarella", "id": "Pizza tradisional dengan tomat dan mozzarella", "th": "พิซซ่าแบบดั้งเดิมกับมะเขือเทศและมอสซาเรลล่า", "vi": "Pizza truyền thống với cà chua và mozzarella", "es": "Pizza tradicional con tomate y mozzarella", "ro": "Pizza tradițională cu roșii și mozzarella"}'
WHERE name = 'Margherita Pizza';

UPDATE menus 
SET 
    name_multilingual = '{"en": "Salmon Nigiri", "ja": "サーモン握り", "zh": "三文鱼握寿司", "ko": "연어 니기리", "pl": "Nigiri z łososiem", "ms": "Nigiri Salmon", "id": "Nigiri Salmon", "th": "นิกิริแซลมอน", "vi": "Nigiri Cá hồi", "es": "Nigiri de Salmón", "ro": "Nigiri cu Somon"}',
    description_multilingual = '{"en": "Fresh salmon sushi", "ja": "新鮮なサーモンの握り寿司", "zh": "新鲜三文鱼握寿司", "ko": "신선한 연어 니기리 스시", "pl": "Świeże sushi z łososiem", "ms": "Sushi salmon segar", "id": "Sushi salmon segar", "th": "ซูชิแซลมอนสด", "vi": "Sushi cá hồi tươi", "es": "Sushi de salmón fresco", "ro": "Sushi cu somon proaspăt"}'
WHERE name = 'Salmon Nigiri';

UPDATE menus 
SET 
    name_multilingual = '{"en": "Tuna Roll", "ja": "マグロロール", "zh": "金枪鱼卷", "ko": "참치 롤", "pl": "Rolka z tuńczykiem", "ms": "Roll Tuna", "id": "Roll Tuna", "th": "โรลทูน่า", "vi": "Roll Cá ngừ", "es": "Roll de Atún", "ro": "Roll cu Ton"}',
    description_multilingual = '{"en": "Spicy tuna roll", "ja": "スパイシーマグロロール", "zh": "辣味金枪鱼卷", "ko": "매운 참치 롤", "pl": "Ostra rolka z tuńczykiem", "ms": "Roll tuna pedas", "id": "Roll tuna pedas", "th": "โรลทูน่าเผ็ด", "vi": "Roll cá ngừ cay", "es": "Roll de atún picante", "ro": "Roll cu ton picant"}'
WHERE name = 'Tuna Roll';

UPDATE menus 
SET 
    name_multilingual = '{"en": "Croissant", "ja": "クロワッサン", "zh": "牛角面包", "ko": "크루아상", "pl": "Croissant", "ms": "Croissant", "id": "Croissant", "th": "ครัวซองต์", "vi": "Croissant", "es": "Croissant", "ro": "Croissant"}',
    description_multilingual = '{"en": "Buttery French croissant", "ja": "バターたっぷりのフランス風クロワッサン", "zh": "黄油丰富的法式牛角面包", "ko": "버터가 풍부한 프랑스식 크루아상", "pl": "Maślany francuski croissant", "ms": "Croissant Perancis berkrim", "id": "Croissant Prancis berlemak", "th": "ครัวซองต์ฝรั่งเศสที่มีเนย", "vi": "Croissant Pháp bơ", "es": "Croissant francés con mantequilla", "ro": "Croissant francez cu unt"}'
WHERE name = 'Croissant';

UPDATE menus 
SET 
    name_multilingual = '{"en": "Cappuccino", "ja": "カプチーノ", "zh": "卡布奇诺", "ko": "카푸치노", "pl": "Cappuccino", "ms": "Cappuccino", "id": "Cappuccino", "th": "คาปูชิโน", "vi": "Cappuccino", "es": "Cappuccino", "ro": "Cappuccino"}',
    description_multilingual = '{"en": "Italian coffee with steamed milk", "ja": "蒸気で温めたミルクを使ったイタリアンコーヒー", "zh": "使用蒸汽加热牛奶的意大利咖啡", "ko": "증기로 데운 우유를 사용한 이탈리안 커피", "pl": "Włoska kawa z mlekiem na parze", "ms": "Kopi Itali dengan susu kukus", "id": "Kopi Italia dengan susu kukus", "th": "กาแฟอิตาลีกับนมร้อน", "vi": "Cà phê Ý với sữa hấp", "es": "Café italiano con leche al vapor", "ro": "Cafea italiană cu lapte aburit"}'
WHERE name = 'Cappuccino';

-- Verify the changes
SELECT 'Restaurants with multilingual support:' as info;
SELECT name, name_multilingual, address_multilingual, description_multilingual 
FROM restaurants 
WHERE name_multilingual IS NOT NULL;

SELECT 'Menus with multilingual support:' as info;
SELECT name, name_multilingual, description_multilingual 
FROM menus 
WHERE name_multilingual IS NOT NULL; 