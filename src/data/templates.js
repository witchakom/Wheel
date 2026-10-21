

export const seq=n=>Array.from({length:n},(_,i)=>String(i+1));

export const TPL=[
{id:'name',n:{en:'Random Name Wheel',th:'วงล้อสุ่มชื่อ'},i:{en:['Alex','Sam','Jordan','Taylor','Morgan','Casey'],th:['อ้อม','บอม','ปลา','ฟ้า','มิ้นท์','เก่ง']}},
{id:'lucky',n:{en:'Lucky Wheel',th:'วงล้อนำโชค'},i:{en:['Lucky!','Try again','Bonus','Jackpot','Nothing','Double','Surprise','Free spin'],th:['โชคดี!','ลองใหม่','โบนัส','แจ็คพอต','ไม่ได้อะไร','สองเท่า','เซอร์ไพรส์','หมุนฟรี']}},
{id:'prize',n:{en:'Prize Wheel',th:'วงล้อรับรางวัล'},i:{en:['Gift Card','Coffee','Sticker','T-Shirt','Mug','Snack'],th:['บัตรของขวัญ','กาแฟ','สติกเกอร์','เสื้อยืด','แก้วน้ำ','ขนม']}},
{id:'decision',n:{en:'Decision Wheel',th:'วงล้อตัดสินใจ'},i:{en:['Do it','Wait','Ask a friend','Skip it','Sleep on it','Go for it'],th:['ทำเลย','รอก่อน','ถามเพื่อน','ข้ามไป','นอนคิดก่อน','ลุยเลย']}},
{id:'number',n:{en:'Number Wheel',th:'วงล้อตัวเลข'},i:{en:seq(12),th:seq(12)}},
{id:'food',n:{en:'Food Wheel',th:'วงล้ออาหาร'},i:{en:['Pad Thai','Som Tam','Pizza','Sushi','Burger','Ramen','Fried Rice','Salad'],th:['ผัดไทย','ส้มตำ','พิซซ่า','ซูชิ','เบอร์เกอร์','ราเม็ง','ข้าวผัด','สลัด']}},
{id:'game',n:{en:'Game Wheel',th:'วงล้อเกม'},i:{en:['Chess','Uno','Poker','Monopoly','Jenga','Charades'],th:['หมากรุก','อูโน่','โป๊กเกอร์','เกมเศรษฐี','เจงก้า','ทายคำใบ้']}},
{id:'yesno',n:{en:'Yes / No Wheel',th:'วงล้อ ใช่ / ไม่ใช่'},i:{en:['Yes','No','Yes','No'],th:['ใช่','ไม่ใช่','ใช่','ไม่ใช่']}},
{id:'color',n:{en:'Color Wheel',th:'วงล้อสี'},i:{en:[['Red','#ef4444'],['Orange','#f97316'],['Yellow','#eab308'],['Green','#22c55e'],['Blue','#3b82f6'],['Purple','#8b5cf6']],th:[['แดง','#ef4444'],['ส้ม','#f97316'],['เหลือง','#eab308'],['เขียว','#22c55e'],['น้ำเงิน','#3b82f6'],['ม่วง','#8b5cf6']]}},
{id:'custom',n:{en:'Custom Wheel',th:'วงล้อกำหนดเอง'},i:{en:['Item 1','Item 2','Item 3'],th:['รายการ 1','รายการ 2','รายการ 3']}}];

export const norm=x=>typeof x=='string'?{t:x}:{t:x[0],c:x[1]};

export const mkWheel=(tp,lang,pal)=>({name:tp.n[lang],pal,items:tp.i[lang].map(norm)});
