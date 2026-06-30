const fs = require('fs');
const path = require('path');

const DOT_PATH = path.join(__dirname, 'csail.dot');
const OUT_PATH = path.join(__dirname, 'csail-data.json');
const THESIS_TITLES_PATH = path.join(__dirname, 'thesis-titles.json');
const THESIS_URLS = {
  'chelsea_finn': 'https://www2.eecs.berkeley.edu/Pubs/TechRpts/2018/EECS-2018-105.html',
  '238967': 'https://www2.eecs.berkeley.edu/Pubs/TechRpts/2018/EECS-2018-133.pdf',
  '18769': 'https://search.proquest.com/openview/b91a32441671fe90c14afe141815fd7c/1?pq-origsite=gscholar&cbl=18750&diss=y'
};
const CUSTOM_NODES = [
  {
    id: 'younghyo_park',
    label: 'Younghyo Park (Me)\nMIT 2028',
    name: 'Younghyo Park (Me)',
    detail: 'MIT 2028',
    year: 2028,
    href: '/',
    role: 'other'
  },
  {
    id: '18769',
    label: 'Frank Chongwoo Park\nHarvard 1991',
    name: 'Frank Chongwoo Park',
    detail: 'Harvard 1991',
    year: 1991,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=18769',
    role: 'other'
  },
  {
    id: 'taeyoon_lee',
    label: 'Taeyoon Lee\nSNU 2019',
    name: 'Taeyoon Lee',
    detail: 'SNU 2019',
    year: 2019,
    href: 'https://sites.google.com/view/taeyoon-lee',
    role: 'other'
  },
  {
    id: 'jaewoon_kwon',
    label: 'Jaewoon Kwon\nSNU 2022',
    name: 'Jaewoon Kwon',
    detail: 'SNU 2022',
    year: 2022,
    href: '',
    role: 'other'
  },
  {
    id: 'yonghyeon_lee',
    label: 'Yonghyeon Lee\nSNU 2023',
    name: 'Yonghyeon Lee',
    detail: 'SNU 2023',
    year: 2023,
    href: 'https://www.gabe-yhlee.com/',
    role: 'other'
  },
  {
    id: '18746',
    label: 'Roger Ware Brockett\nCase Western Reserve 1964',
    name: 'Roger Ware Brockett',
    detail: 'Case Western Reserve 1964',
    year: 1964,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=18746',
    role: 'other'
  },
  {
    id: '92461',
    label: 'Mihajlo D. Mesarovic\nSerbian Academy 1955',
    name: 'Mihajlo D. Mesarovic',
    detail: 'Serbian Academy 1955',
    year: 1955,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=92461',
    role: 'other'
  },
  {
    id: '323631',
    label: 'Ilija Obradovic\nTU Darmstadt 1942',
    name: 'Ilija Obradovic',
    detail: 'TU Darmstadt 1942',
    year: 1942,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=323631',
    role: 'other'
  },
  {
    id: '334752',
    label: 'Theodor Buchhold\n???',
    name: 'Theodor Buchhold',
    detail: '???',
    year: null,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=334752',
    role: 'other'
  },
  {
    id: '334753',
    label: 'Franklin Punga\n???',
    name: 'Franklin Punga',
    detail: '???',
    year: null,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=334753',
    role: 'other'
  },
  {
    id: '58481',
    label: 'Micha Sharir\nTel Aviv University 1976',
    name: 'Micha Sharir',
    detail: 'Tel Aviv University 1976',
    year: 1976,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=58481',
    role: 'other',
    thesisTitle: 'Extreme Operators Between Banach Spaces'
  },
  {
    id: '89106',
    label: 'Vladlen Koltun\nTel Aviv University 2002',
    name: 'Vladlen Koltun',
    detail: 'Tel Aviv University 2002',
    year: 2002,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=89106',
    role: 'other',
    thesisTitle: 'Arrangements in Four Dimensions and Related Structures'
  },
  {
    id: '254743',
    label: 'Sergey Levine\nStanford 2014',
    name: 'Sergey Levine',
    detail: 'Stanford 2014',
    year: 2014,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=254743',
    role: 'other',
    thesisTitle: 'Motor Skill Learning with Local Trajectory Methods'
  },
  {
    id: '298803',
    label: 'Xue Bin Peng\nUC Berkeley 2021',
    name: 'Xue Bin Peng',
    detail: 'UC Berkeley 2021',
    year: 2021,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=298803',
    role: 'other',
    thesisTitle: 'Acquiring Motor Skills through Motion Imitation and Reinforcement Learning'
  },
  {
    id: 'chelsea_finn',
    label: 'Chelsea Finn\nUC Berkeley 2018',
    name: 'Chelsea Finn',
    detail: 'UC Berkeley 2018',
    year: 2018,
    href: 'https://ai.stanford.edu/~cbfinn/',
    role: 'other',
    thesisTitle: 'Learning to Learn with Gradients'
  },
  {
    id: '50186',
    label: 'Kenneth Yigael Goldberg\nCMU 1990',
    name: 'Kenneth Yigael Goldberg',
    detail: 'CMU 1990',
    year: 1990,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=50186',
    role: 'other',
    thesisTitle: 'Stochastic Plans for Robotic Manipulation'
  },
  {
    id: '94558',
    label: 'Kevin Michael Lynch\nCMU 1996',
    name: 'Kevin Michael Lynch',
    detail: 'CMU 1996',
    year: 1996,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=94558',
    role: 'other',
    thesisTitle: 'Nonprehensile Robotic Manipulation: Controllability and Planning'
  },
  {
    id: '245201',
    label: 'Ross Alan Knepper\nCMU 2011',
    name: 'Ross Alan Knepper',
    detail: 'CMU 2011',
    year: 2011,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=245201',
    role: 'other',
    thesisTitle: 'On the Fundamental Relationships Among Path Planning Alternatives'
  },
  {
    id: '215529',
    label: 'Alberto Rodriguez\nCMU 2013',
    name: 'Alberto Rodriguez',
    detail: 'CMU 2013',
    year: 2013,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=215529',
    role: 'other',
    thesisTitle: 'Shape for Contact'
  },
  {
    id: 'antonia_bronars',
    label: 'Antonia Bronars\nMIT 2026',
    name: 'Antonia Bronars',
    detail: 'MIT 2026',
    year: 2026,
    href: '',
    role: 'other'
  },
  {
    id: 'branden_romero',
    label: 'Branden Romero\nMIT 2025',
    name: 'Branden Romero',
    detail: 'MIT 2025',
    year: 2025,
    href: '',
    role: 'other'
  },
  {
    id: 'minyoung_huh',
    label: 'Minyoung Huh\nMIT 2024',
    name: 'Minyoung Huh',
    detail: 'MIT 2024',
    year: 2024,
    href: 'https://minyoungg.github.io/me/',
    role: 'other'
  },
  {
    id: 'anthony_simeonov',
    label: 'Anthony Simeonov\nMIT 2024',
    name: 'Anthony Simeonov',
    detail: 'MIT 2024',
    year: 2024,
    href: 'https://anthonysimeonov.github.io/',
    role: 'other'
  },
  {
    id: 'tao_chen',
    label: 'Tao Chen\nMIT 2024',
    name: 'Tao Chen',
    detail: 'MIT 2024',
    year: 2024,
    href: 'https://taochenshh.github.io/',
    role: 'other'
  },
  {
    id: 'gabe_margolis',
    label: 'Gabe Margolis\nMIT 2026',
    name: 'Gabe Margolis',
    detail: 'MIT 2026',
    year: 2026,
    href: 'https://gmargo11.github.io/',
    role: 'other'
  },
  {
    id: '276446',
    label: 'Nima Fazeli\nMIT 2019',
    name: 'Nima Fazeli',
    detail: 'MIT 2019',
    year: 2019,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=276446',
    role: 'other',
    thesisTitle: 'Inference and Learning for Rigid-Body Models of Manipulation'
  },
  {
    id: '328842',
    label: 'Rachel Holladay\nMIT 2024',
    name: 'Rachel Holladay',
    detail: 'MIT 2024',
    year: 2024,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=328842',
    role: 'other',
    thesisTitle: 'Leveraging Mechanics for Multi-step Robotic Manipulation Planning'
  },
  {
    id: '227627',
    label: 'Dmitry Berenson\nCMU 2011',
    name: 'Dmitry Berenson',
    detail: 'CMU 2011',
    year: 2011,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=227627',
    role: 'other',
    thesisTitle: 'Constrained Manipulation Planning'
  },
  {
    id: '180587',
    label: 'Mehmet R. Dogar\nCMU 2013',
    name: 'Mehmet R. Dogar',
    detail: 'CMU 2013',
    year: 2013,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=180587',
    role: 'other',
    thesisTitle: 'Physics-Based Manipulation Planning in Cluttered Human Environments'
  },
  {
    id: '98529',
    label: 'Alexei (Alyosha) Efros\nUC Berkeley 2003',
    name: 'Alexei (Alyosha) Efros',
    detail: 'UC Berkeley 2003',
    year: 2003,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=98529',
    role: 'other',
    thesisTitle: 'Data-driven Approaches for Texture and Motion'
  },
  {
    id: '259444',
    label: 'Deepak Pathak\nUC Berkeley 2019',
    name: 'Deepak Pathak',
    detail: 'UC Berkeley 2019',
    year: 2019,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=259444',
    role: 'other',
    thesisTitle: 'Learning to Generalize via Self-supervised Prediction'
  },
  {
    id: '315898',
    label: 'Tim Brooks\nUC Berkeley 2023',
    name: 'Tim Brooks',
    detail: 'UC Berkeley 2023',
    year: 2023,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=315898',
    role: 'other',
    thesisTitle: 'Generative Models for Image and Long Video Synthesis'
  },
  {
    id: '315899',
    label: 'Bill Peebles\nUC Berkeley 2023',
    name: 'Bill Peebles',
    detail: 'UC Berkeley 2023',
    year: 2023,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=315899',
    role: 'other',
    thesisTitle: 'Generative Models of Images and Neural Networks'
  },
  {
    id: '228020',
    label: 'Junyan Zhu\nUC Berkeley 2017',
    name: 'Junyan Zhu',
    detail: 'UC Berkeley 2017',
    year: 2017,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=228020',
    role: 'other',
    thesisTitle: 'Learning to Synthesize and Manipulate Natural Images'
  },
  {
    id: '313253',
    label: 'Richard Zhang\nUC Berkeley 2018',
    name: 'Richard Zhang',
    detail: 'UC Berkeley 2018',
    year: 2018,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=313253',
    role: 'other',
    thesisTitle: 'Image Synthesis for Self-Supervised Visual Representation Learning'
  },
  {
    id: '100557',
    label: 'Fei-Fei Li\nCaltech 2005',
    name: 'Fei-Fei Li',
    detail: 'Caltech 2005',
    year: 2005,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=100557',
    role: 'other',
    thesisTitle: 'Visual Recognition: Computational Models and Human Psychophysics'
  },
  {
    id: '259004',
    label: 'Jia Deng\nPrinceton 2012',
    name: 'Jia Deng',
    detail: 'Princeton 2012',
    year: 2012,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=259004',
    role: 'other',
    thesisTitle: 'Large Scale Visual Recognition'
  },
  {
    id: '258986',
    label: 'Andrej Karpathy\nStanford 2016',
    name: 'Andrej Karpathy',
    detail: 'Stanford 2016',
    year: 2016,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=258986',
    role: 'other',
    thesisTitle: 'Connecting Images and Natural Language'
  },
  {
    id: 'jim_fan',
    label: 'Linxi "Jim" Fan\nStanford 2021',
    name: 'Linxi "Jim" Fan',
    detail: 'Stanford 2021',
    year: 2021,
    href: 'https://jimfan.me/',
    role: 'other',
    thesisTitle: 'Training and Deploying Visual Agents at Scale'
  },
  {
    id: '258990',
    label: 'Justin Johnson\nStanford 2018',
    name: 'Justin Johnson',
    detail: 'Stanford 2018',
    year: 2018,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=258990',
    role: 'other',
    thesisTitle: 'Compositional Visual Intelligence'
  },
  {
    id: '258995',
    label: 'Serena Yeung\nStanford 2018',
    name: 'Serena Yeung',
    detail: 'Stanford 2018',
    year: 2018,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=258995',
    role: 'other',
    thesisTitle: 'Visual understanding of human activity: towards ambient intelligence in AI-assisted hospitals'
  },
  {
    id: '258989',
    label: 'Yuke Zhu\nStanford 2019',
    name: 'Yuke Zhu',
    detail: 'Stanford 2019',
    year: 2019,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=258989',
    role: 'other',
    thesisTitle: 'Closing the perception-action loop: towards general-purpose robot autonomy'
  },
  {
    id: '258997',
    label: 'Timnit Gebru\nStanford 2017',
    name: 'Timnit Gebru',
    detail: 'Stanford 2017',
    year: 2017,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=258997',
    role: 'other',
    thesisTitle: 'Visual computational sociology: computer vision methods and challenges'
  },
  {
    id: '343362',
    label: 'Ranjay Krishna\nStanford 2021',
    name: 'Ranjay Krishna',
    detail: 'Stanford 2021',
    year: 2021,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=343362',
    role: 'other',
    thesisTitle: 'Visual Intelligence Through Human Learning'
  },
  {
    id: '343367',
    label: 'Ajay Mandlekar\nStanford 2021',
    name: 'Ajay Mandlekar',
    detail: 'Stanford 2021',
    year: 2021,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=343367',
    role: 'other',
    thesisTitle: 'Building Robot Intelligence by Scaling Human Supervision'
  },
  {
    id: '343364',
    label: 'Danfei Xu\nStanford 2021',
    name: 'Danfei Xu',
    detail: 'Stanford 2021',
    year: 2021,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=343364',
    role: 'other',
    thesisTitle: 'Compositional Reasoning in Robot Learning'
  },
  {
    id: '343371',
    label: 'Agrim Gupta\nStanford 2024',
    name: 'Agrim Gupta',
    detail: 'Stanford 2024',
    year: 2024,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=343371',
    role: 'other',
    thesisTitle: 'Generative Models of Vision and Action'
  },
  {
    id: '100558',
    label: 'Silvio Savarese\nCaltech 2005',
    name: 'Silvio Savarese',
    detail: 'Caltech 2005',
    year: 2005,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=100558',
    role: 'other',
    thesisTitle: 'Shape Reconstruction from Shadows and Reflections'
  },
  {
    id: '84671',
    label: 'Stefano Soatto\nCaltech 1996',
    name: 'Stefano Soatto',
    detail: 'Caltech 1996',
    year: 1996,
    href: 'https://genealogy.math.ndsu.nodak.edu/id.php?id=84671',
    role: 'other',
    thesisTitle: 'A Geometric Framework for Dynamic Vision'
  }
];
const CUSTOM_EDGES = [
  {
    source: '238967',
    target: 'younghyo_park'
  },
  {
    source: '18769',
    target: 'younghyo_park'
  },
  {
    source: '18769',
    target: 'taeyoon_lee'
  },
  {
    source: '18769',
    target: 'jaewoon_kwon'
  },
  {
    source: '18769',
    target: 'yonghyeon_lee'
  },
  {
    source: '18746',
    target: '18769'
  },
  {
    source: '92461',
    target: '18746'
  },
  {
    source: '323631',
    target: '92461'
  },
  {
    source: '334752',
    target: '323631'
  },
  {
    source: '334753',
    target: '323631'
  },
  {
    source: '58481',
    target: '89106'
  },
  {
    source: '89106',
    target: '254743'
  },
  {
    source: '254743',
    target: '298803'
  },
  {
    source: '237131',
    target: '298803'
  },
  {
    source: '254743',
    target: 'chelsea_finn'
  },
  {
    source: '237131',
    target: 'chelsea_finn'
  },
  {
    source: '50075',
    target: '50186'
  },
  {
    source: '50075',
    target: '94558'
  },
  {
    source: '50075',
    target: '245201'
  },
  {
    source: '50075',
    target: '215529'
  },
  {
    source: '238967',
    target: 'antonia_bronars'
  },
  {
    source: '215529',
    target: 'antonia_bronars'
  },
  {
    source: '144827',
    target: 'branden_romero'
  },
  {
    source: 'phillipi',
    target: 'minyoung_huh'
  },
  {
    source: '238967',
    target: 'minyoung_huh'
  },
  {
    source: '238967',
    target: 'anthony_simeonov'
  },
  {
    source: '215529',
    target: 'anthony_simeonov'
  },
  {
    source: '238967',
    target: 'tao_chen'
  },
  {
    source: '238967',
    target: 'gabe_margolis'
  },
  {
    source: '215529',
    target: '276446'
  },
  {
    source: '215529',
    target: '328842'
  },
  {
    source: '96135',
    target: '227627'
  },
  {
    source: '96135',
    target: '180587'
  },
  {
    source: '70152',
    target: '98529'
  },
  {
    source: '98529',
    target: '259444'
  },
  {
    source: '98529',
    target: '315898'
  },
  {
    source: '98529',
    target: '315899'
  },
  {
    source: '98529',
    target: '228020'
  },
  {
    source: '98529',
    target: '313253'
  },
  {
    source: '84689',
    target: '100557'
  },
  {
    source: '100557',
    target: '259004'
  },
  {
    source: '100557',
    target: '258986'
  },
  {
    source: '100557',
    target: 'jim_fan'
  },
  {
    source: '100557',
    target: '258990'
  },
  {
    source: '100557',
    target: '258995'
  },
  {
    source: '100557',
    target: '258989'
  },
  {
    source: '100557',
    target: '258997'
  },
  {
    source: '100557',
    target: '343362'
  },
  {
    source: '100557',
    target: '343367'
  },
  {
    source: '100557',
    target: '343364'
  },
  {
    source: '100557',
    target: '343371'
  },
  {
    source: '84689',
    target: '100558'
  },
  {
    source: '100558',
    target: '343367'
  },
  {
    source: '100558',
    target: '343364'
  },
  {
    source: '84689',
    target: '84671'
  }
];

const NODE_W = 174;
const NODE_H = 54;
const GAP_X = 206;
const GAP_Y = 116;
const MARGIN = 180;
const COMPONENT_GAP = 320;

function stripComment(line) {
  let inQuote = false;
  let escaped = false;

  for (let i = 0; i < line.length - 1; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\' && inQuote) {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && char === '/' && next === '/') {
      return line.slice(0, i);
    }
  }

  return line;
}

function splitStatements(line) {
  const statements = [];
  let start = 0;
  let inQuote = false;
  let escaped = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\' && inQuote) {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && char === ';') {
      statements.push(line.slice(start, i).trim());
      start = i + 1;
    }
  }

  const last = line.slice(start).trim();
  if (last) {
    statements.push(last);
  }
  return statements;
}

function readBareValue(input, start) {
  let i = start;
  while (i < input.length && !/[\s,]/.test(input[i])) {
    i += 1;
  }
  return [input.slice(start, i), i];
}

function readQuotedValue(input, start) {
  let value = '';
  let i = start + 1;
  let escaped = false;

  while (i < input.length) {
    const char = input[i];
    if (escaped) {
      value += `\\${char}`;
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '"') {
      return [value, i + 1];
    } else {
      value += char;
    }
    i += 1;
  }

  return [value, i];
}

function parseAttrs(rawAttrs) {
  const attrs = {};
  let i = 0;

  while (i < rawAttrs.length) {
    while (i < rawAttrs.length && /[\s,]/.test(rawAttrs[i])) {
      i += 1;
    }

    const keyStart = i;
    while (i < rawAttrs.length && /[A-Za-z_]/.test(rawAttrs[i])) {
      i += 1;
    }
    const key = rawAttrs.slice(keyStart, i);

    while (i < rawAttrs.length && /\s/.test(rawAttrs[i])) {
      i += 1;
    }
    if (!key || rawAttrs[i] !== '=') {
      i += 1;
      continue;
    }

    i += 1;
    while (i < rawAttrs.length && /\s/.test(rawAttrs[i])) {
      i += 1;
    }

    let value;
    if (rawAttrs[i] === '"') {
      [value, i] = readQuotedValue(rawAttrs, i);
    } else if (rawAttrs[i] === '<') {
      const end = rawAttrs.indexOf('>', i + 1);
      value = end === -1 ? rawAttrs.slice(i) : rawAttrs.slice(i, end + 1);
      i = end === -1 ? rawAttrs.length : end + 1;
    } else {
      [value, i] = readBareValue(rawAttrs, i);
    }

    attrs[key] = value;
  }

  return attrs;
}

function unescapeDot(value) {
  return String(value || '')
    .replace(/\\n/g, '\n')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

function cleanId(value) {
  return String(value || '').replace(/^"|"$/g, '').trim();
}

function normalizeColor(value) {
  return String(value || '').trim().toLowerCase();
}

function roleFromAttrs(attrs) {
  const color = normalizeColor(attrs.color);
  const fill = normalizeColor(attrs.fillcolor);
  const style = normalizeColor(attrs.style);

  if (color === '#cc6600') {
    return 'current';
  }
  if (color === '#514b47') {
    return 'former';
  }
  if (fill === '#e0e0ff' || (style.includes('filled') && fill)) {
    return 'notable';
  }
  return 'other';
}

function extractYear(label) {
  const matches = String(label || '').match(/\b(1[3-9]\d{2}|20\d{2})\b/g);
  if (!matches || !matches.length) {
    return null;
  }
  return Number(matches[matches.length - 1]);
}

function parseDot(dotText) {
  const nodes = new Map();
  const edges = [];
  let nodeDefaults = {};

  dotText.split(/\r?\n/).forEach((line) => {
    const stripped = stripComment(line).trim();
    if (!stripped || stripped === '{' || stripped === '}' || stripped.startsWith('strict ') || stripped.startsWith('subgraph ')) {
      return;
    }

    splitStatements(stripped).forEach((statement) => {
      if (!statement || statement === '{' || statement === '}') {
        return;
      }

      const nodeDefault = statement.match(/^node\s*\[(.*)\]$/);
      if (nodeDefault) {
        nodeDefaults = { ...nodeDefaults, ...parseAttrs(nodeDefault[1]) };
        return;
      }

      if (/^(graph|edge)\s*\[/.test(statement)) {
        return;
      }

      const edgeMatch = statement.match(/^("[^"]+"|[A-Za-z0-9_]+)\s*->\s*("[^"]+"|[A-Za-z0-9_]+)/);
      if (edgeMatch) {
        edges.push({
          source: cleanId(edgeMatch[1]),
          target: cleanId(edgeMatch[2])
        });
        return;
      }

      const nodeMatch = statement.match(/^("[^"]+"|[A-Za-z0-9_]+)\s*\[(.*)\]$/);
      if (!nodeMatch) {
        return;
      }

      const id = cleanId(nodeMatch[1]);
      if (id === 'foo' || id === 'qrcode') {
        return;
      }

      const attrs = { ...nodeDefaults, ...parseAttrs(nodeMatch[2]) };
      if (!attrs.label) {
        return;
      }

      const label = unescapeDot(attrs.label).trim();
      const labelLines = label.split('\n').map((part) => part.trim()).filter(Boolean);
      const href = attrs.href ? unescapeDot(attrs.href).replace(/\\N/g, id) : '';

      nodes.set(id, {
        id,
        label,
        name: labelLines[0] || id,
        detail: labelLines.slice(1).join(' / '),
        year: extractYear(label),
        href,
        role: roleFromAttrs(attrs)
      });
    });
  });

  const validEdges = edges.filter((edge) => nodes.has(edge.source) && nodes.has(edge.target));
  return { nodes: Array.from(nodes.values()), edges: validEdges };
}

function applyCustomAdditions(graph) {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));

  CUSTOM_NODES.forEach((node) => {
    if (!nodeIds.has(node.id)) {
      graph.nodes.push(node);
      nodeIds.add(node.id);
    }
  });

  CUSTOM_EDGES.forEach((edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      graph.edges.push(edge);
    }
  });
}

function loadThesisTitles() {
  if (!fs.existsSync(THESIS_TITLES_PATH)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(THESIS_TITLES_PATH, 'utf8'));
}

function applyThesisTitles(graph) {
  const thesisTitles = loadThesisTitles();
  graph.nodes.forEach((node) => {
    const title = thesisTitles[node.id];
    if (title) {
      node.thesisTitle = title;
    }
    const url = THESIS_URLS[node.id];
    if (url) {
      node.thesisUrl = url;
    }
  });
}

function compareNodes(a, b, nodesById) {
  const left = nodesById.get(a);
  const right = nodesById.get(b);
  return (left.year || 9999) - (right.year || 9999) || left.name.localeCompare(right.name);
}

function buildIndexes(nodes, edges) {
  const ids = nodes.map((node) => node.id);
  const parents = new Map(ids.map((id) => [id, new Set()]));
  const children = new Map(ids.map((id) => [id, new Set()]));
  const neighbors = new Map(ids.map((id) => [id, new Set()]));

  edges.forEach((edge) => {
    parents.get(edge.target).add(edge.source);
    children.get(edge.source).add(edge.target);
    neighbors.get(edge.source).add(edge.target);
    neighbors.get(edge.target).add(edge.source);
  });

  return { parents, children, neighbors };
}

function getComponents(nodes, neighbors) {
  const seen = new Set();
  const components = [];

  nodes.forEach((node) => {
    if (seen.has(node.id)) {
      return;
    }

    const stack = [node.id];
    const ids = [];
    seen.add(node.id);

    while (stack.length) {
      const id = stack.pop();
      ids.push(id);
      neighbors.get(id).forEach((nextId) => {
        if (!seen.has(nextId)) {
          seen.add(nextId);
          stack.push(nextId);
        }
      });
    }

    components.push(ids);
  });

  return components.sort((a, b) => b.length - a.length);
}

function rankComponent(ids, parents, children, nodesById) {
  const idSet = new Set(ids);
  const indegree = new Map();
  const rank = new Map(ids.map((id) => [id, 0]));
  const queue = [];

  ids.forEach((id) => {
    const degree = Array.from(parents.get(id)).filter((parent) => idSet.has(parent)).length;
    indegree.set(id, degree);
    if (degree === 0) {
      queue.push(id);
    }
  });

  queue.sort((a, b) => compareNodes(a, b, nodesById));
  const visited = [];

  while (queue.length) {
    const id = queue.shift();
    visited.push(id);

    Array.from(children.get(id))
      .filter((child) => idSet.has(child))
      .sort((a, b) => compareNodes(a, b, nodesById))
      .forEach((child) => {
        rank.set(child, Math.max(rank.get(child), rank.get(id) + 1));
        indegree.set(child, indegree.get(child) - 1);
        if (indegree.get(child) === 0) {
          queue.push(child);
          queue.sort((a, b) => compareNodes(a, b, nodesById));
        }
      });
  }

  if (visited.length !== ids.length) {
    ids.forEach((id) => {
      if (!visited.includes(id)) {
        const node = nodesById.get(id);
        rank.set(id, node.year ? Math.max(0, Math.floor((node.year - 1300) / 18)) : 0);
      }
    });
  }

  return rank;
}

function bucketByRank(ids, rank, nodesById) {
  const buckets = new Map();
  ids.forEach((id) => {
    const key = rank.get(id) || 0;
    if (!buckets.has(key)) {
      buckets.set(key, []);
    }
    buckets.get(key).push(id);
  });

  buckets.forEach((bucket) => bucket.sort((a, b) => compareNodes(a, b, nodesById)));
  return buckets;
}

function improveOrdering(buckets, parents, children) {
  const ranks = Array.from(buckets.keys()).sort((a, b) => a - b);
  let order = new Map();

  function refreshOrder() {
    order = new Map();
    ranks.forEach((rank) => {
      buckets.get(rank).forEach((id, index) => order.set(id, index));
    });
  }

  function barycenter(id, relatedIds) {
    const values = Array.from(relatedIds)
      .map((relatedId) => order.get(relatedId))
      .filter((value) => value !== undefined);
    if (!values.length) {
      return null;
    }
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  refreshOrder();

  for (let pass = 0; pass < 8; pass += 1) {
    ranks.slice(1).forEach((rank) => {
      buckets.get(rank).sort((a, b) => {
        const aScore = barycenter(a, parents.get(a));
        const bScore = barycenter(b, parents.get(b));
        if (aScore !== null || bScore !== null) {
          return (aScore ?? order.get(a)) - (bScore ?? order.get(b));
        }
        return order.get(a) - order.get(b);
      });
    });
    refreshOrder();

    ranks.slice(0, -1).reverse().forEach((rank) => {
      buckets.get(rank).sort((a, b) => {
        const aScore = barycenter(a, children.get(a));
        const bScore = barycenter(b, children.get(b));
        if (aScore !== null || bScore !== null) {
          return (aScore ?? order.get(a)) - (bScore ?? order.get(b));
        }
        return order.get(a) - order.get(b);
      });
    });
    refreshOrder();
  }
}

function layoutComponent(ids, indexes, nodesById) {
  const rank = rankComponent(ids, indexes.parents, indexes.children, nodesById);
  const buckets = bucketByRank(ids, rank, nodesById);
  improveOrdering(buckets, indexes.parents, indexes.children);

  const ranks = Array.from(buckets.keys()).sort((a, b) => a - b);
  const maxBucketSize = Math.max(...ranks.map((key) => buckets.get(key).length));
  const width = Math.max(NODE_W, (maxBucketSize - 1) * GAP_X + NODE_W);
  const height = Math.max(NODE_H, (ranks.length - 1) * GAP_Y + NODE_H);
  const placed = [];

  ranks.forEach((rankKey, rankIndex) => {
    const bucket = buckets.get(rankKey);
    const rowWidth = (bucket.length - 1) * GAP_X + NODE_W;
    const xOffset = (width - rowWidth) / 2;

    bucket.forEach((id, index) => {
      placed.push({
        id,
        x: xOffset + index * GAP_X,
        y: rankIndex * GAP_Y,
        rank: rankKey
      });
    });
  });

  return { nodes: placed, width, height };
}

function layoutGraph(nodes, edges) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const indexes = buildIndexes(nodes, edges);
  const components = getComponents(nodes, indexes.neighbors);
  const layouts = components.map((ids) => layoutComponent(ids, indexes, nodesById));
  const mainWidth = Math.max(9000, layouts[0]?.width || 9000);

  let cursorX = MARGIN;
  let cursorY = MARGIN;
  let rowHeight = 0;
  let maxX = 0;
  let maxY = 0;

  layouts.forEach((layout, componentIndex) => {
    if (componentIndex > 0 && cursorX + layout.width > mainWidth + MARGIN) {
      cursorX = MARGIN;
      cursorY += rowHeight + COMPONENT_GAP;
      rowHeight = 0;
    }

    layout.nodes.forEach((placed) => {
      const node = nodesById.get(placed.id);
      node.x = Math.round(cursorX + placed.x);
      node.y = Math.round(cursorY + placed.y);
      node.w = NODE_W;
      node.h = NODE_H;
      node.rank = placed.rank;
      node.component = componentIndex;
    });

    maxX = Math.max(maxX, cursorX + layout.width);
    maxY = Math.max(maxY, cursorY + layout.height);
    cursorX += layout.width + COMPONENT_GAP;
    rowHeight = Math.max(rowHeight, layout.height);
  });

  return {
    width: Math.round(maxX + MARGIN),
    height: Math.round(maxY + MARGIN),
    components: components.length
  };
}

const dotText = fs.readFileSync(DOT_PATH, 'latin1');
const graph = parseDot(dotText);
applyCustomAdditions(graph);
applyThesisTitles(graph);
const bounds = layoutGraph(graph.nodes, graph.edges);

const data = {
  meta: {
    title: 'CSAIL Academic Genealogy',
    sourceDate: '2026-06-27',
    sourceUrl: 'https://people.csail.mit.edu/wollman/genealogy/',
    dotUrl: 'https://people.csail.mit.edu/wollman/genealogy/2026-06-27/csail.dot',
    layout: 'Custom layered DAG layout rendered with HTML nodes'
  },
  bounds,
  nodes: graph.nodes.sort((a, b) => a.name.localeCompare(b.name)),
  edges: graph.edges.map((edge, index) => ({ id: `edge-${index}`, ...edge }))
};

fs.writeFileSync(OUT_PATH, `${JSON.stringify(data)}\n`);
console.log(`Wrote ${data.nodes.length} nodes and ${data.edges.length} edges to ${path.relative(process.cwd(), OUT_PATH)}`);
