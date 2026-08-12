const METRO_DATA = [
  {
    id: '1',
    name: '1号线',
    color: '#FFE100',
    textColor: '#000000',
    isLoop: false,
    isExpress: false,
    stations: ['西塱', '坑口', '花地湾', '芳村', '黄沙', '长寿路', '陈家祠', '西门口', '公园前', '农讲所', '烈士陵园', '东山口', '杨箕', '体育西路', '体育中心', '广州东站']
  },
  {
    id: '2',
    name: '2号线',
    color: '#0062AE',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: false,
    stations: ['广州南站', '石壁', '会江', '南浦', '洛溪', '南洲', '东晓南', '江泰路', '昌岗', '江南西', '市二宫', '海珠广场', '公园前', '纪念堂', '越秀公园', '广州火车站', '三元里', '飞翔公园', '白云公园', '白云文化广场', '萧岗', '江夏', '黄边', '嘉禾望岗']
  },
  {
    id: '3-airport',
    name: '3号线(机场线)',
    color: '#F08300',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: false,
    stations: ['体育西路', '林和西', '广州东站', '燕塘', '梅花园', '京溪南方医院', '同和', '永泰', '白云大道北', '嘉禾望岗', '龙归', '人和', '高增', '机场南(1号航站楼)', '机场北(2号航站楼)']
  },
  {
    id: '3-panyu',
    name: '3号线(番禺线)',
    color: '#F08300',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: false,
    stations: ['番禺广场', '市桥', '汉溪长隆', '大石', '厦滘', '沥滘', '大塘', '客村', '广州塔', '珠江新城', '体育西路', '石牌桥', '岗顶', '华师', '五山', '天河客运站']
  },
  {
    id: '4',
    name: '4号线',
    color: '#009A78',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: false,
    stations: ['黄村', '车陂', '车陂南', '万胜围', '官洲', '大学城北', '大学城南', '新造', '石碁', '海傍', '低涌', '东涌', '庆盛', '黄阁汽车城', '黄阁', '蕉门', '金洲', '飞沙角', '广隆', '大涌', '塘坑', '南横', '南沙客运港']
  },
  {
    id: '5',
    name: '5号线',
    color: '#E50000',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: false,
    stations: ['滘口', '坦尾', '中山八', '西场', '西村', '广州火车站', '小北', '淘金', '区庄', '动物园', '杨箕', '五羊邨', '珠江新城', '猎德', '潭村', '员村', '科韵路', '车陂南', '东圃', '三溪', '鱼珠', '大沙地', '大沙东', '文冲']
  },
  {
    id: '6',
    name: '6号线',
    color: '#C5002E',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: false,
    stations: ['浔峰岗', '横沙', '沙贝', '河沙', '坦尾', '如意坊', '黄沙', '文化公园', '一德路', '海珠广场', '北京路', '团一大广场', '东湖', '东山口', '区庄', '黄花岗', '沙河顶', '沙河', '天平架', '燕塘', '天河客运站', '长湴', '植物园', '龙洞', '柯木塱', '高塘石', '黄陂', '金峰', '暹岗', '苏元', '萝岗', '香雪']
  },
  {
    id: '7',
    name: '7号线',
    color: '#89D3DF',
    textColor: '#000000',
    isLoop: false,
    isExpress: false,
    stations: ['大学城南', '板桥', '员岗', '南村万博', '汉溪长隆', '钟村', '谢村', '石壁', '广州南站', '大洲', '陈村北', '陈村', '锦龙', '南涌', '美的', '北滘公园', '美的大道']
  },
  {
    id: '8',
    name: '8号线',
    color: '#00899A',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: false,
    stations: ['万胜围', '琶洲', '新港东', '磨碟沙', '赤岗', '客村', '鹭江', '中大', '晓港', '昌岗', '宝岗大道', '沙园', '凤凰新村', '同福西', '文化公园', '华林寺', '陈家祠', '彩虹桥', '西村', '鹅掌坦', '同德', '上步', '聚龙', '石潭', '小坪', '石井', '亭岗', '滘心']
  },
  {
    id: '9',
    name: '9号线',
    color: '#8FB6CD',
    textColor: '#000000',
    isLoop: false,
    isExpress: false,
    stations: ['高增', '清塘', '清布', '莲塘', '马鞍山公园', '花都广场', '花果山公园', '花城路', '广州北站', '花都汽车城', '飞鹅岭']
  },
  {
    id: '11',
    name: '11号线',
    color: '#199E5B',
    textColor: '#FFFFFF',
    isLoop: true,
    isExpress: false,
    stations: ['龙潭', '云台花园', '赤沙', '琶洲', '员村', '天河公园', '华景路', '华师', '龙口西', '广州东站', '沙河', '大金钟路', '中医药大学', '梓元岗', '广州火车站', '流花', '彩虹桥', '中山八', '如意坊', '石围塘', '芳村', '大冲口', '沙涌', '鹤洞东', '棣园', '燕岗', '江泰路', '五凤', '逸景路', '上涌', '大塘', '田心村']
  },
  {
    id: '13',
    name: '13号线',
    color: '#8FE0D4',
    textColor: '#000000',
    isLoop: false,
    isExpress: false,
    stations: ['鱼珠', '丰乐路', '双岗', '南海神庙', '夏园', '南岗', '沙村', '白江', '新塘', '官湖', '新沙']
  },
  {
    id: '14',
    name: '14号线',
    color: '#F2C75C',
    textColor: '#000000',
    isLoop: false,
    isExpress: false,
    stations: ['嘉禾望岗', '白云东平', '夏良', '太和', '竹料', '钟落潭', '马沥', '新和', '太平', '神岗', '赤草', '从化客运站', '东风']
  },
  {
    id: '14-knowledge',
    name: '14号线(知识城线)',
    color: '#F2C75C',
    textColor: '#000000',
    isLoop: false,
    isExpress: false,
    stations: ['新和', '红卫', '新南', '枫下', '知识城', '何棠下', '旺村', '汤村', '镇龙北', '镇龙']
  },
  {
    id: '18',
    name: '18号线',
    color: '#0057B8',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: true,
    stations: ['万顷沙', '横沥', '番禺广场', '南村万博', '沙溪', '龙潭', '磨碟沙', '冼村']
  },
  {
    id: '21',
    name: '21号线',
    color: '#4F2D7F',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: false,
    stations: ['员村', '天河公园', '棠东', '黄村', '大观南路', '天河智慧城', '神舟路', '科学城', '苏元', '水西', '长平', '金坑', '镇龙西', '镇龙', '中新', '坑贝', '凤岗', '朱村', '山田', '钟岗', '增城广场']
  },
  {
    id: '22',
    name: '22号线',
    color: '#FF7E1E',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: true,
    stations: ['芳村', '西塱', '南漖', '南浦西', '陈头岗', '广州南站', '市广路', '番禺广场']
  },
  {
    id: 'guangfo',
    name: '广佛线',
    color: '#D2C700',
    textColor: '#000000',
    isLoop: false,
    isExpress: false,
    stations: ['新城东', '东平', '世纪莲', '澜石', '魁奇路', '季华园', '同济路', '祖庙', '普君北路', '朝安', '桂城', '南桂路', '礌岗', '千灯湖', '金融高新区', '龙溪', '菊树', '西塱', '鹤洞', '沙涌', '沙园', '燕岗', '石溪', '南洲', '沥滘']
  },
  {
    id: 'apm',
    name: 'APM线',
    color: '#00B6B6',
    textColor: '#FFFFFF',
    isLoop: false,
    isExpress: false,
    stations: ['林和西', '体育中心南', '天河南', '黄埔大道', '妇儿中心', '花城大道', '大剧院', '海心沙', '广州塔']
  }
];

const DEFAULT_ORIGIN = { lineId: '18', station: '沙溪' };

const TIME_CONFIG = {
  normalPerStation: 2.5,
  expressPerStation: 4,
  apmPerStation: 2,
  transferTime: 5
};