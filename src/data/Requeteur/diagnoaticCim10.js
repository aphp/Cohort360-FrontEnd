// import apiRequest from './apiRequest'

export const fetchStatusDiagnostic = async () => {
  const res = [
    {
      code: 'actif',
      display: 'Actif'
    },
    {
      code: 'supp',
      display: 'Supprimé'
    }
  ]
  return res
}

export const fetchKindDiagnostic = async () => {
  const res = [
    {
      code: 'dp',
      display: 'Diagnostic principale'
    },
    {
      code: 'das',
      display: 'Diagnostic associé'
    },
    {
      code: 'dr',
      display: 'Diagnostic rempli'
    },
    {
      code: 'dad',
      display: 'Diagnostic à demi rempli'
    }
  ]
  return res
}

export const fetchCim10Diagnostic = async () => {
  const res = [
    {
      'DIAGNOSIS CODE': '0010',
      'LONG DESCRIPTION': 'Cholera due to vibrio cholerae',
      'SHORT DESCRIPTION': 'Cholera d/t vib cholerae'
    },
    {
      'DIAGNOSIS CODE': '0011',
      'LONG DESCRIPTION': 'Cholera due to vibrio cholerae el tor',
      'SHORT DESCRIPTION': 'Cholera d/t vib el tor'
    },
    {
      'DIAGNOSIS CODE': '0019',
      'LONG DESCRIPTION': 'Cholera, unspecified',
      'SHORT DESCRIPTION': 'Cholera NOS'
    },
    {
      'DIAGNOSIS CODE': '0020',
      'LONG DESCRIPTION': 'Typhoid fever',
      'SHORT DESCRIPTION': 'Typhoid fever'
    },
    {
      'DIAGNOSIS CODE': '0021',
      'LONG DESCRIPTION': 'Paratyphoid fever A',
      'SHORT DESCRIPTION': 'Paratyphoid fever a'
    },
    {
      'DIAGNOSIS CODE': '0022',
      'LONG DESCRIPTION': 'Paratyphoid fever B',
      'SHORT DESCRIPTION': 'Paratyphoid fever b'
    },
    {
      'DIAGNOSIS CODE': '0023',
      'LONG DESCRIPTION': 'Paratyphoid fever C',
      'SHORT DESCRIPTION': 'Paratyphoid fever c'
    },
    {
      'DIAGNOSIS CODE': '0029',
      'LONG DESCRIPTION': 'Paratyphoid fever, unspecified',
      'SHORT DESCRIPTION': 'Paratyphoid fever NOS'
    },
    {
      'DIAGNOSIS CODE': '0030',
      'LONG DESCRIPTION': 'Salmonella gastroenteritis',
      'SHORT DESCRIPTION': 'Salmonella enteritis'
    },
    {
      'DIAGNOSIS CODE': '0031',
      'LONG DESCRIPTION': 'Salmonella septicemia',
      'SHORT DESCRIPTION': 'Salmonella septicemia'
    },
    {
      'DIAGNOSIS CODE': '00320',
      'LONG DESCRIPTION': 'Localized salmonella infection, unspecified',
      'SHORT DESCRIPTION': 'Local salmonella inf NOS'
    },
    {
      'DIAGNOSIS CODE': '00321',
      'LONG DESCRIPTION': 'Salmonella meningitis',
      'SHORT DESCRIPTION': 'Salmonella meningitis'
    },
    {
      'DIAGNOSIS CODE': '00322',
      'LONG DESCRIPTION': 'Salmonella pneumonia',
      'SHORT DESCRIPTION': 'Salmonella pneumonia'
    },
    {
      'DIAGNOSIS CODE': '00323',
      'LONG DESCRIPTION': 'Salmonella arthritis',
      'SHORT DESCRIPTION': 'Salmonella arthritis'
    },
    {
      'DIAGNOSIS CODE': '00324',
      'LONG DESCRIPTION': 'Salmonella osteomyelitis',
      'SHORT DESCRIPTION': 'Salmonella osteomyelitis'
    },
    {
      'DIAGNOSIS CODE': '00329',
      'LONG DESCRIPTION': 'Other localized salmonella infections',
      'SHORT DESCRIPTION': 'Local salmonella inf NEC'
    },
    {
      'DIAGNOSIS CODE': '0038',
      'LONG DESCRIPTION': 'Other specified salmonella infections',
      'SHORT DESCRIPTION': 'Salmonella infection NEC'
    },
    {
      'DIAGNOSIS CODE': '0039',
      'LONG DESCRIPTION': 'Salmonella infection, unspecified',
      'SHORT DESCRIPTION': 'Salmonella infection NOS'
    },
    {
      'DIAGNOSIS CODE': '0040',
      'LONG DESCRIPTION': 'Shigella dysenteriae',
      'SHORT DESCRIPTION': 'Shigella dysenteriae'
    },
    {
      'DIAGNOSIS CODE': '0041',
      'LONG DESCRIPTION': 'Shigella flexneri',
      'SHORT DESCRIPTION': 'Shigella flexneri'
    },
    {
      'DIAGNOSIS CODE': '0042',
      'LONG DESCRIPTION': 'Shigella boydii',
      'SHORT DESCRIPTION': 'Shigella boydii'
    },
    {
      'DIAGNOSIS CODE': '0043',
      'LONG DESCRIPTION': 'Shigella sonnei',
      'SHORT DESCRIPTION': 'Shigella sonnei'
    },
    {
      'DIAGNOSIS CODE': '0048',
      'LONG DESCRIPTION': 'Other specified shigella infections',
      'SHORT DESCRIPTION': 'Shigella infection NEC'
    },
    {
      'DIAGNOSIS CODE': '0049',
      'LONG DESCRIPTION': 'Shigellosis, unspecified',
      'SHORT DESCRIPTION': 'Shigellosis NOS'
    },
    {
      'DIAGNOSIS CODE': '0050',
      'LONG DESCRIPTION': 'Staphylococcal food poisoning',
      'SHORT DESCRIPTION': 'Staph food poisoning'
    },
    {
      'DIAGNOSIS CODE': '0051',
      'LONG DESCRIPTION': 'Botulism food poisoning',
      'SHORT DESCRIPTION': 'Botulism food poisoning'
    },
    {
      'DIAGNOSIS CODE': '0052',
      'LONG DESCRIPTION': 'Food poisoning due to Clostridium perfringens (C. welchii)',
      'SHORT DESCRIPTION': 'Food pois d/t c. perfrin'
    },
    {
      'DIAGNOSIS CODE': '0053',
      'LONG DESCRIPTION': 'Food poisoning due to other Clostridia',
      'SHORT DESCRIPTION': 'Food pois: clostrid NEC'
    },
    {
      'DIAGNOSIS CODE': '0054',
      'LONG DESCRIPTION': 'Food poisoning due to Vibrio parahaemolyticus',
      'SHORT DESCRIPTION': 'Food pois: v. parahaem'
    },
    {
      'DIAGNOSIS CODE': '00581',
      'LONG DESCRIPTION': 'Food poisoning due to Vibrio vulnificus',
      'SHORT DESCRIPTION': 'Food poisn d/t v. vulnif'
    },
    {
      'DIAGNOSIS CODE': '00589',
      'LONG DESCRIPTION': 'Other bacterial food poisoning',
      'SHORT DESCRIPTION': 'Bact food poisoning NEC'
    },
    {
      'DIAGNOSIS CODE': '0059',
      'LONG DESCRIPTION': 'Food poisoning, unspecified',
      'SHORT DESCRIPTION': 'Food poisoning NOS'
    },
    {
      'DIAGNOSIS CODE': '0060',
      'LONG DESCRIPTION': 'Acute amebic dysentery without mention of abscess',
      'SHORT DESCRIPTION': 'Ac amebiasis w/o abscess'
    },
    {
      'DIAGNOSIS CODE': '0061',
      'LONG DESCRIPTION': 'Chronic intestinal amebiasis without mention of abscess',
      'SHORT DESCRIPTION': 'Chr amebiasis w/o absces'
    },
    {
      'DIAGNOSIS CODE': '0062',
      'LONG DESCRIPTION': 'Amebic nondysenteric colitis',
      'SHORT DESCRIPTION': 'Amebic nondysent colitis'
    },
    {
      'DIAGNOSIS CODE': '0063',
      'LONG DESCRIPTION': 'Amebic liver abscess',
      'SHORT DESCRIPTION': 'Amebic liver abscess'
    },
    {
      'DIAGNOSIS CODE': '0064',
      'LONG DESCRIPTION': 'Amebic lung abscess',
      'SHORT DESCRIPTION': 'Amebic lung abscess'
    },
    {
      'DIAGNOSIS CODE': '0065',
      'LONG DESCRIPTION': 'Amebic brain abscess',
      'SHORT DESCRIPTION': 'Amebic brain abscess'
    },
    {
      'DIAGNOSIS CODE': '0066',
      'LONG DESCRIPTION': 'Amebic skin ulceration',
      'SHORT DESCRIPTION': 'Amebic skin ulceration'
    },
    {
      'DIAGNOSIS CODE': '0068',
      'LONG DESCRIPTION': 'Amebic infection of other sites',
      'SHORT DESCRIPTION': 'Amebic infection NEC'
    },
    {
      'DIAGNOSIS CODE': '0069',
      'LONG DESCRIPTION': 'Amebiasis, unspecified',
      'SHORT DESCRIPTION': 'Amebiasis NOS'
    },
    {
      'DIAGNOSIS CODE': '0070',
      'LONG DESCRIPTION': 'Balantidiasis',
      'SHORT DESCRIPTION': 'Balantidiasis'
    },
    {
      'DIAGNOSIS CODE': '0071',
      'LONG DESCRIPTION': 'Giardiasis',
      'SHORT DESCRIPTION': 'Giardiasis'
    },
    {
      'DIAGNOSIS CODE': '0072',
      'LONG DESCRIPTION': 'Coccidiosis',
      'SHORT DESCRIPTION': 'Coccidiosis'
    },
    {
      'DIAGNOSIS CODE': '0073',
      'LONG DESCRIPTION': 'Intestinal trichomoniasis',
      'SHORT DESCRIPTION': 'Intest trichomoniasis'
    },
    {
      'DIAGNOSIS CODE': '0074',
      'LONG DESCRIPTION': 'Cryptosporidiosis',
      'SHORT DESCRIPTION': 'Cryptosporidiosis'
    },
    {
      'DIAGNOSIS CODE': '0075',
      'LONG DESCRIPTION': 'Cyclosporiasis',
      'SHORT DESCRIPTION': 'Cyclosporiasis'
    },
    {
      'DIAGNOSIS CODE': '0078',
      'LONG DESCRIPTION': 'Other specified protozoal intestinal diseases',
      'SHORT DESCRIPTION': 'Protozoal intest dis NEC'
    },
    {
      'DIAGNOSIS CODE': '0079',
      'LONG DESCRIPTION': 'Unspecified protozoal intestinal disease',
      'SHORT DESCRIPTION': 'Protozoal intest dis NOS'
    },
    {
      'DIAGNOSIS CODE': '00800',
      'LONG DESCRIPTION': 'Intestinal infection due to E. coli, unspecified',
      'SHORT DESCRIPTION': 'Intest infec e coli NOS'
    },
    {
      'DIAGNOSIS CODE': '00801',
      'LONG DESCRIPTION': 'Intestinal infection due to enteropathogenic E. coli',
      'SHORT DESCRIPTION': 'Int inf e coli entrpath'
    },
    {
      'DIAGNOSIS CODE': '00802',
      'LONG DESCRIPTION': 'Intestinal infection due to enterotoxigenic E. coli',
      'SHORT DESCRIPTION': 'Int inf e coli entrtoxgn'
    },
    {
      'DIAGNOSIS CODE': '00803',
      'LONG DESCRIPTION': 'Intestinal infection due to enteroinvasive E. coli',
      'SHORT DESCRIPTION': 'Int inf e coli entrnvsv'
    },
    {
      'DIAGNOSIS CODE': '00804',
      'LONG DESCRIPTION': 'Intestinal infection due to enterohemorrhagic E. coli',
      'SHORT DESCRIPTION': 'Int inf e coli entrhmrg'
    },
    {
      'DIAGNOSIS CODE': '00809',
      'LONG DESCRIPTION': 'Intestinal infection due to other intestinal E. coli infections',
      'SHORT DESCRIPTION': 'Int inf e coli spcf NEC'
    },
    {
      'DIAGNOSIS CODE': '0081',
      'LONG DESCRIPTION': 'Intestinal infection due to arizona group of paracolon bacilli',
      'SHORT DESCRIPTION': 'Arizona enteritis'
    },
    {
      'DIAGNOSIS CODE': '0082',
      'LONG DESCRIPTION': 'Intestinal infection due to aerobacter aerogenes',
      'SHORT DESCRIPTION': 'Aerobacter enteritis'
    },
    {
      'DIAGNOSIS CODE': '0083',
      'LONG DESCRIPTION': 'Intestinal infection due to proteus (mirabilis) (morganii)',
      'SHORT DESCRIPTION': 'Proteus enteritis'
    },
    {
      'DIAGNOSIS CODE': '00841',
      'LONG DESCRIPTION': 'Intestinal infection due to staphylococcus',
      'SHORT DESCRIPTION': 'Staphylococc enteritis'
    },
    {
      'DIAGNOSIS CODE': '00842',
      'LONG DESCRIPTION': 'Intestinal infection due to pseudomonas',
      'SHORT DESCRIPTION': 'Pseudomonas enteritis'
    },
    {
      'DIAGNOSIS CODE': '00843',
      'LONG DESCRIPTION': 'Intestinal infection due to campylobacter',
      'SHORT DESCRIPTION': 'Int infec campylobacter'
    },
    {
      'DIAGNOSIS CODE': '00844',
      'LONG DESCRIPTION': 'Intestinal infection due to yersinia enterocolitica',
      'SHORT DESCRIPTION': 'Int inf yrsnia entrcltca'
    },
    {
      'DIAGNOSIS CODE': '00845',
      'LONG DESCRIPTION': 'Intestinal infection due to Clostridium difficile',
      'SHORT DESCRIPTION': 'Int inf clstrdium dfcile'
    },
    {
      'DIAGNOSIS CODE': '00846',
      'LONG DESCRIPTION': 'Intestinal infection due to other anaerobes',
      'SHORT DESCRIPTION': 'Intes infec oth anerobes'
    },
    {
      'DIAGNOSIS CODE': '00847',
      'LONG DESCRIPTION': 'Intestinal infection due to other gram-negative bacteria',
      'SHORT DESCRIPTION': 'Int inf oth grm neg bctr'
    },
    {
      'DIAGNOSIS CODE': '00849',
      'LONG DESCRIPTION': 'Intestinal infection due to other organisms',
      'SHORT DESCRIPTION': 'Bacterial enteritis NEC'
    },
    {
      'DIAGNOSIS CODE': '0085',
      'LONG DESCRIPTION': 'Bacterial enteritis, unspecified',
      'SHORT DESCRIPTION': 'Bacterial enteritis NOS'
    },
    {
      'DIAGNOSIS CODE': '00861',
      'LONG DESCRIPTION': 'Enteritis due to rotavirus',
      'SHORT DESCRIPTION': 'Intes infec rotavirus'
    },
    {
      'DIAGNOSIS CODE': '00862',
      'LONG DESCRIPTION': 'Enteritis due to adenovirus',
      'SHORT DESCRIPTION': 'Intes infec adenovirus'
    },
    {
      'DIAGNOSIS CODE': '00863',
      'LONG DESCRIPTION': 'Enteritis due to norwalk virus',
      'SHORT DESCRIPTION': 'Int inf norwalk virus'
    },
    {
      'DIAGNOSIS CODE': '00864',
      'LONG DESCRIPTION': "Enteritis due to other small round viruses [SRV's]",
      'SHORT DESCRIPTION': 'Int inf oth sml rnd vrus'
    },
    {
      'DIAGNOSIS CODE': '00865',
      'LONG DESCRIPTION': 'Enteritis due to calicivirus',
      'SHORT DESCRIPTION': 'Enteritis d/t calicivirs'
    },
    {
      'DIAGNOSIS CODE': '00866',
      'LONG DESCRIPTION': 'Enteritis due to astrovirus',
      'SHORT DESCRIPTION': 'Intes infec astrovirus'
    },
    {
      'DIAGNOSIS CODE': '00867',
      'LONG DESCRIPTION': 'Enteritis due to enterovirus nec',
      'SHORT DESCRIPTION': 'Int inf enterovirus NEC'
    },
    {
      'DIAGNOSIS CODE': '00869',
      'LONG DESCRIPTION': 'Enteritis due to other viral enteritis',
      'SHORT DESCRIPTION': 'Other viral intes infec'
    },
    {
      'DIAGNOSIS CODE': '0088',
      'LONG DESCRIPTION': 'Intestinal infection due to other organism, not elsewhere classified',
      'SHORT DESCRIPTION': 'Viral enteritis NOS'
    },
    {
      'DIAGNOSIS CODE': '0090',
      'LONG DESCRIPTION': 'Infectious colitis, enteritis, and gastroenteritis',
      'SHORT DESCRIPTION': 'Infectious enteritis NOS'
    },
    {
      'DIAGNOSIS CODE': '0091',
      'LONG DESCRIPTION': 'Colitis, enteritis, and gastroenteritis of presumed infectious origin',
      'SHORT DESCRIPTION': 'Enteritis of infect orig'
    },
    {
      'DIAGNOSIS CODE': '0092',
      'LONG DESCRIPTION': 'Infectious diarrhea',
      'SHORT DESCRIPTION': 'Infectious diarrhea NOS'
    },
    {
      'DIAGNOSIS CODE': '0093',
      'LONG DESCRIPTION': 'Diarrhea of presumed infectious origin',
      'SHORT DESCRIPTION': 'Diarrhea of infect orig'
    },
    {
      'DIAGNOSIS CODE': '01000',
      'LONG DESCRIPTION': 'Primary tuberculous infection, unspecified',
      'SHORT DESCRIPTION': 'Prim TB complex-unspec'
    },
    {
      'DIAGNOSIS CODE': '01001',
      'LONG DESCRIPTION': 'Primary tuberculous infection, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Prim TB complex-no exam'
    },
    {
      'DIAGNOSIS CODE': '01002',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Prim TB complex-exm unkn'
    },
    {
      'DIAGNOSIS CODE': '01003',
      'LONG DESCRIPTION': 'Primary tuberculous infection, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Prim TB complex-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01004',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Prim TB complex-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01005',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Prim TB complex-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01006',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Prim TB complex-oth test'
    },
    {
      'DIAGNOSIS CODE': '01010',
      'LONG DESCRIPTION': 'Tuberculous pleurisy in primary progressive tuberculosis, unspecified',
      'SHORT DESCRIPTION': 'Prim TB pleurisy-unspec'
    },
    {
      'DIAGNOSIS CODE': '01011',
      'LONG DESCRIPTION':
        'Tuberculous pleurisy in primary progressive tuberculosis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Prim TB pleurisy-no exam'
    },
    {
      'DIAGNOSIS CODE': '01012',
      'LONG DESCRIPTION':
        'Tuberculous pleurisy in primary progressive tuberculosis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Prim TB pleur-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01013',
      'LONG DESCRIPTION':
        'Tuberculous pleurisy in primary progressive tuberculosis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Prim TB pleuris-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01014',
      'LONG DESCRIPTION':
        'Tuberculous pleurisy in primary progressive tuberculosis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Prim TB pleurisy-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01015',
      'LONG DESCRIPTION':
        'Tuberculous pleurisy in primary progressive tuberculosis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Prim TB pleuris-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01016',
      'LONG DESCRIPTION':
        'Tuberculous pleurisy in primary progressive tuberculosis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Prim TB pleuris-oth test'
    },
    {
      'DIAGNOSIS CODE': '01080',
      'LONG DESCRIPTION': 'Other primary progressive tuberculosis, unspecified',
      'SHORT DESCRIPTION': 'Prim prog TB NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01081',
      'LONG DESCRIPTION':
        'Other primary progressive tuberculosis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Prim prog TB NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01082',
      'LONG DESCRIPTION':
        'Other primary progressive tuberculosis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Prim pr TB NEC-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01083',
      'LONG DESCRIPTION': 'Other primary progressive tuberculosis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Prim prg TB NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01084',
      'LONG DESCRIPTION':
        'Other primary progressive tuberculosis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Prim prog TB NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01085',
      'LONG DESCRIPTION':
        'Other primary progressive tuberculosis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Prim prg TB NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01086',
      'LONG DESCRIPTION':
        'Other primary progressive tuberculosis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Prim prg TB NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01090',
      'LONG DESCRIPTION': 'Primary tuberculous infection, unspecified, unspecified',
      'SHORT DESCRIPTION': 'Primary TB NOS-unspec'
    },
    {
      'DIAGNOSIS CODE': '01091',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, unspecified, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Primary TB NOS-no exam'
    },
    {
      'DIAGNOSIS CODE': '01092',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, unspecified, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Primary TB NOS-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01093',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, unspecified, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Primary TB NOS-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01094',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, unspecified, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Primary TB NOS-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01095',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, unspecified, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Primary TB NOS-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01096',
      'LONG DESCRIPTION':
        'Primary tuberculous infection, unspecified, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Primary TB NOS-oth test'
    },
    {
      'DIAGNOSIS CODE': '01100',
      'LONG DESCRIPTION': 'Tuberculosis of lung, infiltrative, unspecified',
      'SHORT DESCRIPTION': 'TB lung infiltr-unspec'
    },
    {
      'DIAGNOSIS CODE': '01101',
      'LONG DESCRIPTION': 'Tuberculosis of lung, infiltrative, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB lung infiltr-no exam'
    },
    {
      'DIAGNOSIS CODE': '01102',
      'LONG DESCRIPTION':
        'Tuberculosis of lung, infiltrative, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB lung infiltr-exm unkn'
    },
    {
      'DIAGNOSIS CODE': '01103',
      'LONG DESCRIPTION': 'Tuberculosis of lung, infiltrative, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB lung infiltr-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01104',
      'LONG DESCRIPTION':
        'Tuberculosis of lung, infiltrative, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB lung infiltr-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01105',
      'LONG DESCRIPTION':
        'Tuberculosis of lung, infiltrative, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB lung infiltr-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01106',
      'LONG DESCRIPTION':
        'Tuberculosis of lung, infiltrative, tubercle bacilli not found bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB lung infiltr-oth test'
    },
    {
      'DIAGNOSIS CODE': '01110',
      'LONG DESCRIPTION': 'Tuberculosis of lung, nodular, unspecified',
      'SHORT DESCRIPTION': 'TB lung nodular-unspec'
    },
    {
      'DIAGNOSIS CODE': '01111',
      'LONG DESCRIPTION': 'Tuberculosis of lung, nodular, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB lung nodular-no exam'
    },
    {
      'DIAGNOSIS CODE': '01112',
      'LONG DESCRIPTION':
        'Tuberculosis of lung, nodular, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB lung nodul-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01113',
      'LONG DESCRIPTION': 'Tuberculosis of lung, nodular, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB lung nodular-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01114',
      'LONG DESCRIPTION':
        'Tuberculosis of lung, nodular, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB lung nodular-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01115',
      'LONG DESCRIPTION':
        'Tuberculosis of lung, nodular, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB lung nodular-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01116',
      'LONG DESCRIPTION':
        'Tuberculosis of lung, nodular, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB lung nodular-oth test'
    },
    {
      'DIAGNOSIS CODE': '01120',
      'LONG DESCRIPTION': 'Tuberculosis of lung with cavitation, unspecified',
      'SHORT DESCRIPTION': 'TB lung w cavity-unspec'
    },
    {
      'DIAGNOSIS CODE': '01121',
      'LONG DESCRIPTION': 'Tuberculosis of lung with cavitation, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB lung w cavity-no exam'
    },
    {
      'DIAGNOSIS CODE': '01122',
      'LONG DESCRIPTION':
        'Tuberculosis of lung with cavitation, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB lung cavity-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01123',
      'LONG DESCRIPTION': 'Tuberculosis of lung with cavitation, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB lung w cavit-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01124',
      'LONG DESCRIPTION':
        'Tuberculosis of lung with cavitation, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB lung w cavity-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01125',
      'LONG DESCRIPTION':
        'Tuberculosis of lung with cavitation, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB lung w cavit-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01126',
      'LONG DESCRIPTION':
        'Tuberculosis of lung with cavitation, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB lung w cavit-oth test'
    },
    {
      'DIAGNOSIS CODE': '01130',
      'LONG DESCRIPTION': 'Tuberculosis of bronchus, unspecified',
      'SHORT DESCRIPTION': 'TB of bronchus-unspec'
    },
    {
      'DIAGNOSIS CODE': '01131',
      'LONG DESCRIPTION': 'Tuberculosis of bronchus, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of bronchus-no exam'
    },
    {
      'DIAGNOSIS CODE': '01132',
      'LONG DESCRIPTION': 'Tuberculosis of bronchus, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of bronchus-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01133',
      'LONG DESCRIPTION': 'Tuberculosis of bronchus, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of bronchus-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01134',
      'LONG DESCRIPTION':
        'Tuberculosis of bronchus, tubercle bacilli not found (in sputum) by microscopy, but found in bacterial culture',
      'SHORT DESCRIPTION': 'TB of bronchus-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01135',
      'LONG DESCRIPTION':
        'Tuberculosis of bronchus, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of bronchus-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01136',
      'LONG DESCRIPTION':
        'Tuberculosis of bronchus, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of bronchus-oth test'
    },
    {
      'DIAGNOSIS CODE': '01140',
      'LONG DESCRIPTION': 'Tuberculous fibrosis of lung, unspecified',
      'SHORT DESCRIPTION': 'TB lung fibrosis-unspec'
    },
    {
      'DIAGNOSIS CODE': '01141',
      'LONG DESCRIPTION': 'Tuberculous fibrosis of lung, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB lung fibrosis-no exam'
    },
    {
      'DIAGNOSIS CODE': '01142',
      'LONG DESCRIPTION':
        'Tuberculous fibrosis of lung, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB lung fibros-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01143',
      'LONG DESCRIPTION': 'Tuberculous fibrosis of lung, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB lung fibros-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01144',
      'LONG DESCRIPTION':
        'Tuberculous fibrosis of lung, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB lung fibrosis-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01145',
      'LONG DESCRIPTION':
        'Tuberculous fibrosis of lung, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB lung fibros-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01146',
      'LONG DESCRIPTION':
        'Tuberculous fibrosis of lung, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB lung fibros-oth test'
    },
    {
      'DIAGNOSIS CODE': '01150',
      'LONG DESCRIPTION': 'Tuberculous bronchiectasis, unspecified',
      'SHORT DESCRIPTION': 'TB bronchiectasis-unspec'
    },
    {
      'DIAGNOSIS CODE': '01151',
      'LONG DESCRIPTION': 'Tuberculous bronchiectasis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB bronchiect-no exam'
    },
    {
      'DIAGNOSIS CODE': '01152',
      'LONG DESCRIPTION':
        'Tuberculous bronchiectasis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB bronchiect-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01153',
      'LONG DESCRIPTION': 'Tuberculous bronchiectasis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB bronchiect-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01154',
      'LONG DESCRIPTION':
        'Tuberculous bronchiectasis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB bronchiect-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01155',
      'LONG DESCRIPTION':
        'Tuberculous bronchiectasis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB bronchiect-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01156',
      'LONG DESCRIPTION':
        'Tuberculous bronchiectasis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB bronchiect-oth test'
    },
    {
      'DIAGNOSIS CODE': '01160',
      'LONG DESCRIPTION': 'Tuberculous pneumonia [any form], unspecified',
      'SHORT DESCRIPTION': 'TB pneumonia-unspec'
    },
    {
      'DIAGNOSIS CODE': '01161',
      'LONG DESCRIPTION': 'Tuberculous pneumonia [any form], bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB pneumonia-no exam'
    },
    {
      'DIAGNOSIS CODE': '01162',
      'LONG DESCRIPTION':
        'Tuberculous pneumonia [any form], bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB pneumonia-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01163',
      'LONG DESCRIPTION': 'Tuberculous pneumonia [any form], tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB pneumonia-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01164',
      'LONG DESCRIPTION':
        'Tuberculous pneumonia [any form], tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB pneumonia-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01165',
      'LONG DESCRIPTION':
        'Tuberculous pneumonia [any form], tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB pneumonia-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01166',
      'LONG DESCRIPTION':
        'Tuberculous pneumonia [any form], tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB pneumonia-oth test'
    },
    {
      'DIAGNOSIS CODE': '01170',
      'LONG DESCRIPTION': 'Tuberculous pneumothorax, unspecified',
      'SHORT DESCRIPTION': 'TB pneumothorax-unspec'
    },
    {
      'DIAGNOSIS CODE': '01171',
      'LONG DESCRIPTION': 'Tuberculous pneumothorax, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB pneumothorax-no exam'
    },
    {
      'DIAGNOSIS CODE': '01172',
      'LONG DESCRIPTION': 'Tuberculous pneumothorax, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB pneumothorx-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01173',
      'LONG DESCRIPTION': 'Tuberculous pneumothorax, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB pneumothorax-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01174',
      'LONG DESCRIPTION':
        'Tuberculous pneumothorax, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB pneumothorax-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01175',
      'LONG DESCRIPTION':
        'Tuberculous pneumothorax, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB pneumothorax-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01176',
      'LONG DESCRIPTION':
        'Tuberculous pneumothorax, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB pneumothorax-oth test'
    },
    {
      'DIAGNOSIS CODE': '01180',
      'LONG DESCRIPTION': 'Other specified pulmonary tuberculosis, unspecified',
      'SHORT DESCRIPTION': 'Pulmonary TB NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01181',
      'LONG DESCRIPTION':
        'Other specified pulmonary tuberculosis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Pulmonary TB NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01182',
      'LONG DESCRIPTION':
        'Other specified pulmonary tuberculosis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Pulmon TB NEC-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01183',
      'LONG DESCRIPTION': 'Other specified pulmonary tuberculosis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Pulmon TB NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01184',
      'LONG DESCRIPTION':
        'Other specified pulmonary tuberculosis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Pulmon TB NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01185',
      'LONG DESCRIPTION':
        'Other specified pulmonary tuberculosis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Pulmon TB NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01186',
      'LONG DESCRIPTION':
        'Other specified pulmonary tuberculosis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Pulmon TB NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01190',
      'LONG DESCRIPTION': 'Pulmonary tuberculosis, unspecified, unspecified',
      'SHORT DESCRIPTION': 'Pulmonary TB NOS-unspec'
    },
    {
      'DIAGNOSIS CODE': '01191',
      'LONG DESCRIPTION': 'Pulmonary tuberculosis, unspecified, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Pulmonary TB NOS-no exam'
    },
    {
      'DIAGNOSIS CODE': '01192',
      'LONG DESCRIPTION':
        'Pulmonary tuberculosis, unspecified, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Pulmon TB NOS-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01193',
      'LONG DESCRIPTION': 'Pulmonary tuberculosis, unspecified, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Pulmon TB NOS-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01194',
      'LONG DESCRIPTION':
        'Pulmonary tuberculosis, unspecified, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Pulmon TB NOS-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01195',
      'LONG DESCRIPTION':
        'Pulmonary tuberculosis, unspecified, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Pulmon TB NOS-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01196',
      'LONG DESCRIPTION':
        'Pulmonary tuberculosis, unspecified, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Pulmon TB NOS-oth test'
    },
    {
      'DIAGNOSIS CODE': '01200',
      'LONG DESCRIPTION': 'Tuberculous pleurisy, unspecified',
      'SHORT DESCRIPTION': 'TB pleurisy-unspec'
    },
    {
      'DIAGNOSIS CODE': '01201',
      'LONG DESCRIPTION': 'Tuberculous pleurisy, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB pleurisy-no exam'
    },
    {
      'DIAGNOSIS CODE': '01202',
      'LONG DESCRIPTION': 'Tuberculous pleurisy, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB pleurisy-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01203',
      'LONG DESCRIPTION': 'Tuberculous pleurisy, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB pleurisy-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01204',
      'LONG DESCRIPTION':
        'Tuberculous pleurisy, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB pleurisy-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01205',
      'LONG DESCRIPTION':
        'Tuberculous pleurisy, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB pleurisy-histolog dx'
    },
    {
      'DIAGNOSIS CODE': '01206',
      'LONG DESCRIPTION':
        'Tuberculous pleurisy, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB pleurisy-oth test'
    },
    {
      'DIAGNOSIS CODE': '01210',
      'LONG DESCRIPTION': 'Tuberculosis of intrathoracic lymph nodes, unspecified',
      'SHORT DESCRIPTION': 'TB thoracic nodes-unspec'
    },
    {
      'DIAGNOSIS CODE': '01211',
      'LONG DESCRIPTION':
        'Tuberculosis of intrathoracic lymph nodes, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB thorax node-no exam'
    },
    {
      'DIAGNOSIS CODE': '01212',
      'LONG DESCRIPTION':
        'Tuberculosis of intrathoracic lymph nodes, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB thorax node-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01213',
      'LONG DESCRIPTION': 'Tuberculosis of intrathoracic lymph nodes, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB thorax node-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01214',
      'LONG DESCRIPTION':
        'Tuberculosis of intrathoracic lymph nodes, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB thorax node-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01215',
      'LONG DESCRIPTION':
        'Tuberculosis of intrathoracic lymph nodes, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB thorax node-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01216',
      'LONG DESCRIPTION':
        'Tuberculosis of intrathoracic lymph nodes, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB thorax node-oth test'
    },
    {
      'DIAGNOSIS CODE': '01220',
      'LONG DESCRIPTION': 'Isolated tracheal or bronchial tuberculosis, unspecified',
      'SHORT DESCRIPTION': 'Isol tracheal tb-unspec'
    },
    {
      'DIAGNOSIS CODE': '01221',
      'LONG DESCRIPTION':
        'Isolated tracheal or bronchial tuberculosis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Isol tracheal tb-no exam'
    },
    {
      'DIAGNOSIS CODE': '01222',
      'LONG DESCRIPTION':
        'Isolated tracheal or bronchial tuberculosis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Isol trach tb-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01223',
      'LONG DESCRIPTION':
        'Isolated tracheal or bronchial tuberculosis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Isolat trach tb-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01224',
      'LONG DESCRIPTION':
        'Isolated tracheal or bronchial tuberculosis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Isol tracheal tb-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01225',
      'LONG DESCRIPTION':
        'Isolated tracheal or bronchial tuberculosis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Isolat trach tb-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01226',
      'LONG DESCRIPTION':
        'Isolated tracheal or bronchial tuberculosis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Isolat trach tb-oth test'
    },
    {
      'DIAGNOSIS CODE': '01230',
      'LONG DESCRIPTION': 'Tuberculous laryngitis, unspecified',
      'SHORT DESCRIPTION': 'TB laryngitis-unspec'
    },
    {
      'DIAGNOSIS CODE': '01231',
      'LONG DESCRIPTION': 'Tuberculous laryngitis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB laryngitis-no exam'
    },
    {
      'DIAGNOSIS CODE': '01232',
      'LONG DESCRIPTION': 'Tuberculous laryngitis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB laryngitis-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01233',
      'LONG DESCRIPTION': 'Tuberculous laryngitis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB laryngitis-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01234',
      'LONG DESCRIPTION':
        'Tuberculous laryngitis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB laryngitis-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01235',
      'LONG DESCRIPTION':
        'Tuberculous laryngitis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB laryngitis-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01236',
      'LONG DESCRIPTION':
        'Tuberculous laryngitis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB laryngitis-oth test'
    },
    {
      'DIAGNOSIS CODE': '01280',
      'LONG DESCRIPTION': 'Other specified respiratory tuberculosis, unspecified',
      'SHORT DESCRIPTION': 'Resp TB NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01281',
      'LONG DESCRIPTION':
        'Other specified respiratory tuberculosis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Resp TB NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01282',
      'LONG DESCRIPTION':
        'Other specified respiratory tuberculosis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Resp TB NEC-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01283',
      'LONG DESCRIPTION': 'Other specified respiratory tuberculosis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Resp TB NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01284',
      'LONG DESCRIPTION':
        'Other specified respiratory tuberculosis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Resp TB NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01285',
      'LONG DESCRIPTION':
        'Other specified respiratory tuberculosis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Resp TB NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01286',
      'LONG DESCRIPTION':
        'Other specified respiratory tuberculosis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Resp TB NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01300',
      'LONG DESCRIPTION': 'Tuberculous meningitis, unspecified',
      'SHORT DESCRIPTION': 'TB meningitis-unspec'
    },
    {
      'DIAGNOSIS CODE': '01301',
      'LONG DESCRIPTION': 'Tuberculous meningitis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB meningitis-no exam'
    },
    {
      'DIAGNOSIS CODE': '01302',
      'LONG DESCRIPTION': 'Tuberculous meningitis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB meningitis-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01303',
      'LONG DESCRIPTION': 'Tuberculous meningitis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB meningitis-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01304',
      'LONG DESCRIPTION':
        'Tuberculous meningitis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB meningitis-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01305',
      'LONG DESCRIPTION':
        'Tuberculous meningitis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB meningitis-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01306',
      'LONG DESCRIPTION':
        'Tuberculous meningitis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB meningitis-oth test'
    },
    {
      'DIAGNOSIS CODE': '01310',
      'LONG DESCRIPTION': 'Tuberculoma of meninges, unspecified',
      'SHORT DESCRIPTION': 'Tubrclma meninges-unspec'
    },
    {
      'DIAGNOSIS CODE': '01311',
      'LONG DESCRIPTION': 'Tuberculoma of meninges, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Tubrclma mening-no exam'
    },
    {
      'DIAGNOSIS CODE': '01312',
      'LONG DESCRIPTION': 'Tuberculoma of meninges, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Tubrclma menin-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01313',
      'LONG DESCRIPTION': 'Tuberculoma of meninges, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Tubrclma mening-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01314',
      'LONG DESCRIPTION':
        'Tuberculoma of meninges, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Tubrclma mening-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01315',
      'LONG DESCRIPTION':
        'Tuberculoma of meninges, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Tubrclma mening-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01316',
      'LONG DESCRIPTION':
        'Tuberculoma of meninges, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Tubrclma mening-oth test'
    },
    {
      'DIAGNOSIS CODE': '01320',
      'LONG DESCRIPTION': 'Tuberculoma of brain, unspecified',
      'SHORT DESCRIPTION': 'Tuberculoma brain-unspec'
    },
    {
      'DIAGNOSIS CODE': '01321',
      'LONG DESCRIPTION': 'Tuberculoma of brain, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Tubrcloma brain-no exam'
    },
    {
      'DIAGNOSIS CODE': '01322',
      'LONG DESCRIPTION': 'Tuberculoma of brain, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Tubrclma brain-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01323',
      'LONG DESCRIPTION': 'Tuberculoma of brain, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Tubrcloma brain-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01324',
      'LONG DESCRIPTION':
        'Tuberculoma of brain, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Tubrcloma brain-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01325',
      'LONG DESCRIPTION':
        'Tuberculoma of brain, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Tubrcloma brain-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01326',
      'LONG DESCRIPTION':
        'Tuberculoma of brain, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Tubrcloma brain-oth test'
    },
    {
      'DIAGNOSIS CODE': '01330',
      'LONG DESCRIPTION': 'Tuberculous abscess of brain, unspecified',
      'SHORT DESCRIPTION': 'TB brain abscess-unspec'
    },
    {
      'DIAGNOSIS CODE': '01331',
      'LONG DESCRIPTION': 'Tuberculous abscess of brain, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB brain abscess-no exam'
    },
    {
      'DIAGNOSIS CODE': '01332',
      'LONG DESCRIPTION':
        'Tuberculous abscess of brain, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB brain absc-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01333',
      'LONG DESCRIPTION': 'Tuberculous abscess of brain, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB brain absc-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01334',
      'LONG DESCRIPTION':
        'Tuberculous abscess of brain, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB brain abscess-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01335',
      'LONG DESCRIPTION':
        'Tuberculous abscess of brain, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB brain absc-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01336',
      'LONG DESCRIPTION':
        'Tuberculous abscess of brain, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB brain absc-oth test'
    },
    {
      'DIAGNOSIS CODE': '01340',
      'LONG DESCRIPTION': 'Tuberculoma of spinal cord, unspecified',
      'SHORT DESCRIPTION': 'Tubrclma sp cord-unspec'
    },
    {
      'DIAGNOSIS CODE': '01341',
      'LONG DESCRIPTION': 'Tuberculoma of spinal cord, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Tubrclma sp cord-no exam'
    },
    {
      'DIAGNOSIS CODE': '01342',
      'LONG DESCRIPTION':
        'Tuberculoma of spinal cord, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Tubrclma sp cd-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01343',
      'LONG DESCRIPTION': 'Tuberculoma of spinal cord, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Tubrclma sp crd-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01344',
      'LONG DESCRIPTION':
        'Tuberculoma of spinal cord, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Tubrclma sp cord-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01345',
      'LONG DESCRIPTION':
        'Tuberculoma of spinal cord, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Tubrclma sp crd-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01346',
      'LONG DESCRIPTION':
        'Tuberculoma of spinal cord, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Tubrclma sp crd-oth test'
    },
    {
      'DIAGNOSIS CODE': '01350',
      'LONG DESCRIPTION': 'Tuberculous abscess of spinal cord, unspecified',
      'SHORT DESCRIPTION': 'TB sp crd abscess-unspec'
    },
    {
      'DIAGNOSIS CODE': '01351',
      'LONG DESCRIPTION': 'Tuberculous abscess of spinal cord, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB sp crd absc-no exam'
    },
    {
      'DIAGNOSIS CODE': '01352',
      'LONG DESCRIPTION':
        'Tuberculous abscess of spinal cord, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB sp crd absc-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01353',
      'LONG DESCRIPTION': 'Tuberculous abscess of spinal cord, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB sp crd absc-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01354',
      'LONG DESCRIPTION':
        'Tuberculous abscess of spinal cord, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB sp crd absc-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01355',
      'LONG DESCRIPTION':
        'Tuberculous abscess of spinal cord, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB sp crd absc-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01356',
      'LONG DESCRIPTION':
        'Tuberculous abscess of spinal cord, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB sp crd absc-oth test'
    },
    {
      'DIAGNOSIS CODE': '01360',
      'LONG DESCRIPTION': 'Tuberculous encephalitis or myelitis, unspecified',
      'SHORT DESCRIPTION': 'TB encephalitis-unspec'
    },
    {
      'DIAGNOSIS CODE': '01361',
      'LONG DESCRIPTION': 'Tuberculous encephalitis or myelitis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB encephalitis-no exam'
    },
    {
      'DIAGNOSIS CODE': '01362',
      'LONG DESCRIPTION':
        'Tuberculous encephalitis or myelitis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB encephalit-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01363',
      'LONG DESCRIPTION': 'Tuberculous encephalitis or myelitis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB encephalitis-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01364',
      'LONG DESCRIPTION':
        'Tuberculous encephalitis or myelitis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB encephalitis-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01365',
      'LONG DESCRIPTION':
        'Tuberculous encephalitis or myelitis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB encephalitis-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01366',
      'LONG DESCRIPTION':
        'Tuberculous encephalitis or myelitis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB encephalitis-oth test'
    },
    {
      'DIAGNOSIS CODE': '01380',
      'LONG DESCRIPTION': 'Other specified tuberculosis of central nervous system, unspecified',
      'SHORT DESCRIPTION': 'Cns TB NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01381',
      'LONG DESCRIPTION':
        'Other specified tuberculosis of central nervous system, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Cns TB NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01382',
      'LONG DESCRIPTION':
        'Other specified tuberculosis of central nervous system, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Cns TB NEC-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01383',
      'LONG DESCRIPTION':
        'Other specified tuberculosis of central nervous system, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Cns TB NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01384',
      'LONG DESCRIPTION':
        'Other specified tuberculosis of central nervous system, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Cns TB NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01385',
      'LONG DESCRIPTION':
        'Other specified tuberculosis of central nervous system, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Cns TB NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01386',
      'LONG DESCRIPTION':
        'Other specified tuberculosis of central nervous system, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Cns TB NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01390',
      'LONG DESCRIPTION': 'Unspecified tuberculosis of central nervous system, unspecified',
      'SHORT DESCRIPTION': 'Cns TB NOS-unspec'
    },
    {
      'DIAGNOSIS CODE': '01391',
      'LONG DESCRIPTION':
        'Unspecified tuberculosis of central nervous system, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Cns TB NOS-no exam'
    },
    {
      'DIAGNOSIS CODE': '01392',
      'LONG DESCRIPTION':
        'Unspecified tuberculosis of central nervous system, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Cns TB NOS-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01393',
      'LONG DESCRIPTION':
        'Unspecified tuberculosis of central nervous system, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Cns TB NOS-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01394',
      'LONG DESCRIPTION':
        'Unspecified tuberculosis of central nervous system, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Cns TB NOS-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01395',
      'LONG DESCRIPTION':
        'Unspecified tuberculosis of central nervous system, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Cns TB NOS-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01396',
      'LONG DESCRIPTION':
        'Unspecified tuberculosis of central nervous system, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Cns TB NOS-oth test'
    },
    {
      'DIAGNOSIS CODE': '01400',
      'LONG DESCRIPTION': 'Tuberculous peritonitis, unspecified',
      'SHORT DESCRIPTION': 'TB peritonitis-unspec'
    },
    {
      'DIAGNOSIS CODE': '01401',
      'LONG DESCRIPTION': 'Tuberculous peritonitis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB peritonitis-no exam'
    },
    {
      'DIAGNOSIS CODE': '01402',
      'LONG DESCRIPTION': 'Tuberculous peritonitis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB peritonitis-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01403',
      'LONG DESCRIPTION': 'Tuberculous peritonitis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB peritonitis-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01404',
      'LONG DESCRIPTION':
        'Tuberculous peritonitis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB peritonitis-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01405',
      'LONG DESCRIPTION':
        'Tuberculous peritonitis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB peritonitis-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01406',
      'LONG DESCRIPTION':
        'Tuberculous peritonitis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB peritonitis-oth test'
    },
    {
      'DIAGNOSIS CODE': '01480',
      'LONG DESCRIPTION': 'Other tuberculosis of intestines, peritoneum, and mesenteric glands, unspecified',
      'SHORT DESCRIPTION': 'Intestinal TB NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01481',
      'LONG DESCRIPTION':
        'Other tuberculosis of intestines, peritoneum, and mesenteric glands, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Intestin TB NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01482',
      'LONG DESCRIPTION':
        'Other tuberculosis of intestines, peritoneum, and mesenteric glands, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Intest TB NEC-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01483',
      'LONG DESCRIPTION':
        'Other tuberculosis of intestines, peritoneum, and mesenteric glands, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Intestin TB NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01484',
      'LONG DESCRIPTION':
        'Other tuberculosis of intestines, peritoneum, and mesenteric glands, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Intestin TB NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01485',
      'LONG DESCRIPTION':
        'Other tuberculosis of intestines, peritoneum, and mesenteric glands, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Intestin TB NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01486',
      'LONG DESCRIPTION':
        'Other tuberculosis of intestines, peritoneum, and mesenteric glands, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Intestin TB NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01500',
      'LONG DESCRIPTION': 'Tuberculosis of vertebral column, unspecified',
      'SHORT DESCRIPTION': 'TB of vertebra-unspec'
    },
    {
      'DIAGNOSIS CODE': '01501',
      'LONG DESCRIPTION': 'Tuberculosis of vertebral column, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of vertebra-no exam'
    },
    {
      'DIAGNOSIS CODE': '01502',
      'LONG DESCRIPTION':
        'Tuberculosis of vertebral column, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of vertebra-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01503',
      'LONG DESCRIPTION': 'Tuberculosis of vertebral column, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of vertebra-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01504',
      'LONG DESCRIPTION':
        'Tuberculosis of vertebral column, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of vertebra-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01505',
      'LONG DESCRIPTION':
        'Tuberculosis of vertebral column, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of vertebra-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01506',
      'LONG DESCRIPTION':
        'Tuberculosis of vertebral column, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of vertebra-oth test'
    },
    {
      'DIAGNOSIS CODE': '01510',
      'LONG DESCRIPTION': 'Tuberculosis of hip, unspecified',
      'SHORT DESCRIPTION': 'TB of hip-unspec'
    },
    {
      'DIAGNOSIS CODE': '01511',
      'LONG DESCRIPTION': 'Tuberculosis of hip, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of hip-no exam'
    },
    {
      'DIAGNOSIS CODE': '01512',
      'LONG DESCRIPTION': 'Tuberculosis of hip, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of hip-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01513',
      'LONG DESCRIPTION': 'Tuberculosis of hip, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of hip-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01514',
      'LONG DESCRIPTION':
        'Tuberculosis of hip, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of hip-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01515',
      'LONG DESCRIPTION':
        'Tuberculosis of hip, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of hip-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01516',
      'LONG DESCRIPTION':
        'Tuberculosis of hip, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of hip-oth test'
    },
    {
      'DIAGNOSIS CODE': '01520',
      'LONG DESCRIPTION': 'Tuberculosis of knee, unspecified',
      'SHORT DESCRIPTION': 'TB of knee-unspec'
    },
    {
      'DIAGNOSIS CODE': '01521',
      'LONG DESCRIPTION': 'Tuberculosis of knee, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of knee-no exam'
    },
    {
      'DIAGNOSIS CODE': '01522',
      'LONG DESCRIPTION': 'Tuberculosis of knee, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of knee-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01523',
      'LONG DESCRIPTION': 'Tuberculosis of knee, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of knee-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01524',
      'LONG DESCRIPTION':
        'Tuberculosis of knee, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of knee-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01525',
      'LONG DESCRIPTION':
        'Tuberculosis of knee, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of knee-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01526',
      'LONG DESCRIPTION':
        'Tuberculosis of knee, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of knee-oth test'
    },
    {
      'DIAGNOSIS CODE': '01550',
      'LONG DESCRIPTION': 'Tuberculosis of limb bones, unspecified',
      'SHORT DESCRIPTION': 'TB of limb bones-unspec'
    },
    {
      'DIAGNOSIS CODE': '01551',
      'LONG DESCRIPTION': 'Tuberculosis of limb bones, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB limb bones-no exam'
    },
    {
      'DIAGNOSIS CODE': '01552',
      'LONG DESCRIPTION':
        'Tuberculosis of limb bones, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB limb bones-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01553',
      'LONG DESCRIPTION': 'Tuberculosis of limb bones, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB limb bones-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01554',
      'LONG DESCRIPTION':
        'Tuberculosis of limb bones, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB limb bones-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01555',
      'LONG DESCRIPTION':
        'Tuberculosis of limb bones, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB limb bones-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01556',
      'LONG DESCRIPTION':
        'Tuberculosis of limb bones, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB limb bones-oth test'
    },
    {
      'DIAGNOSIS CODE': '01560',
      'LONG DESCRIPTION': 'Tuberculosis of mastoid, unspecified',
      'SHORT DESCRIPTION': 'TB of mastoid-unspec'
    },
    {
      'DIAGNOSIS CODE': '01561',
      'LONG DESCRIPTION': 'Tuberculosis of mastoid, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of mastoid-no exam'
    },
    {
      'DIAGNOSIS CODE': '01562',
      'LONG DESCRIPTION': 'Tuberculosis of mastoid, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of mastoid-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01563',
      'LONG DESCRIPTION': 'Tuberculosis of mastoid, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of mastoid-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01564',
      'LONG DESCRIPTION':
        'Tuberculosis of mastoid, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of mastoid-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01565',
      'LONG DESCRIPTION':
        'Tuberculosis of mastoid, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of mastoid-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01566',
      'LONG DESCRIPTION':
        'Tuberculosis of mastoid, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of mastoid-oth test'
    },
    {
      'DIAGNOSIS CODE': '01570',
      'LONG DESCRIPTION': 'Tuberculosis of other specified bone, unspecified',
      'SHORT DESCRIPTION': 'TB of bone NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01571',
      'LONG DESCRIPTION': 'Tuberculosis of other specified bone, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of bone NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01572',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified bone, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of bone NEC-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01573',
      'LONG DESCRIPTION': 'Tuberculosis of other specified bone, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of bone NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01574',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified bone, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of bone NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01575',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified bone, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of bone NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01576',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified bone, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of bone NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01580',
      'LONG DESCRIPTION': 'Tuberculosis of other specified joint, unspecified',
      'SHORT DESCRIPTION': 'TB of joint NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01581',
      'LONG DESCRIPTION': 'Tuberculosis of other specified joint, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of joint NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01582',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified joint, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB joint NEC-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01583',
      'LONG DESCRIPTION': 'Tuberculosis of other specified joint, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of joint NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01584',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified joint, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of joint NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01585',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified joint, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of joint NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01586',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified joint, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of joint NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01590',
      'LONG DESCRIPTION': 'Tuberculosis of unspecified bones and joints, unspecified',
      'SHORT DESCRIPTION': 'TB bone/joint NOS-unspec'
    },
    {
      'DIAGNOSIS CODE': '01591',
      'LONG DESCRIPTION':
        'Tuberculosis of unspecified bones and joints, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB bone/jt NOS-no exam'
    },
    {
      'DIAGNOSIS CODE': '01592',
      'LONG DESCRIPTION':
        'Tuberculosis of unspecified bones and joints, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB bone/jt NOS-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01593',
      'LONG DESCRIPTION':
        'Tuberculosis of unspecified bones and joints, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB bone/jt NOS-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01594',
      'LONG DESCRIPTION':
        'Tuberculosis of unspecified bones and joints, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB bone/jt NOS-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01595',
      'LONG DESCRIPTION':
        'Tuberculosis of unspecified bones and joints, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB bone/jt NOS-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01596',
      'LONG DESCRIPTION':
        'Tuberculosis of unspecified bones and joints, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB bone/jt NOS-oth test'
    },
    {
      'DIAGNOSIS CODE': '01600',
      'LONG DESCRIPTION': 'Tuberculosis of kidney, unspecified',
      'SHORT DESCRIPTION': 'TB of kidney-unspec'
    },
    {
      'DIAGNOSIS CODE': '01601',
      'LONG DESCRIPTION': 'Tuberculosis of kidney, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of kidney-no exam'
    },
    {
      'DIAGNOSIS CODE': '01602',
      'LONG DESCRIPTION': 'Tuberculosis of kidney, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of kidney-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01603',
      'LONG DESCRIPTION': 'Tuberculosis of kidney, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of kidney-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01604',
      'LONG DESCRIPTION':
        'Tuberculosis of kidney, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of kidney-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01605',
      'LONG DESCRIPTION':
        'Tuberculosis of kidney, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of kidney-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01606',
      'LONG DESCRIPTION':
        'Tuberculosis of kidney, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of kidney-oth test'
    },
    {
      'DIAGNOSIS CODE': '01610',
      'LONG DESCRIPTION': 'Tuberculosis of bladder, unspecified',
      'SHORT DESCRIPTION': 'TB of bladder-unspec'
    },
    {
      'DIAGNOSIS CODE': '01611',
      'LONG DESCRIPTION': 'Tuberculosis of bladder, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of bladder-no exam'
    },
    {
      'DIAGNOSIS CODE': '01612',
      'LONG DESCRIPTION': 'Tuberculosis of bladder, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of bladder-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01613',
      'LONG DESCRIPTION': 'Tuberculosis of bladder, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of bladder-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01614',
      'LONG DESCRIPTION':
        'Tuberculosis of bladder, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of bladder-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01615',
      'LONG DESCRIPTION':
        'Tuberculosis of bladder, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of bladder-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01616',
      'LONG DESCRIPTION':
        'Tuberculosis of bladder, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of bladder-oth test'
    },
    {
      'DIAGNOSIS CODE': '01620',
      'LONG DESCRIPTION': 'Tuberculosis of ureter, unspecified',
      'SHORT DESCRIPTION': 'TB of ureter-unspec'
    },
    {
      'DIAGNOSIS CODE': '01621',
      'LONG DESCRIPTION': 'Tuberculosis of ureter, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of ureter-no exam'
    },
    {
      'DIAGNOSIS CODE': '01622',
      'LONG DESCRIPTION': 'Tuberculosis of ureter, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of ureter-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01623',
      'LONG DESCRIPTION': 'Tuberculosis of ureter, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of ureter-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01624',
      'LONG DESCRIPTION':
        'Tuberculosis of ureter, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of ureter-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01625',
      'LONG DESCRIPTION':
        'Tuberculosis of ureter, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of ureter-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01626',
      'LONG DESCRIPTION':
        'Tuberculosis of ureter, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of ureter-oth test'
    },
    {
      'DIAGNOSIS CODE': '01630',
      'LONG DESCRIPTION': 'Tuberculosis of other urinary organs, unspecified',
      'SHORT DESCRIPTION': 'TB urinary NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01631',
      'LONG DESCRIPTION': 'Tuberculosis of other urinary organs, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB urinary NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01632',
      'LONG DESCRIPTION':
        'Tuberculosis of other urinary organs, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB urinary NEC-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01633',
      'LONG DESCRIPTION': 'Tuberculosis of other urinary organs, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB urinary NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01634',
      'LONG DESCRIPTION':
        'Tuberculosis of other urinary organs, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB urinary NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01635',
      'LONG DESCRIPTION':
        'Tuberculosis of other urinary organs, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB urinary NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01636',
      'LONG DESCRIPTION':
        'Tuberculosis of other urinary organs, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB urinary NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01640',
      'LONG DESCRIPTION': 'Tuberculosis of epididymis, unspecified',
      'SHORT DESCRIPTION': 'TB epididymis-unspec'
    },
    {
      'DIAGNOSIS CODE': '01641',
      'LONG DESCRIPTION': 'Tuberculosis of epididymis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB epididymis-no exam'
    },
    {
      'DIAGNOSIS CODE': '01642',
      'LONG DESCRIPTION':
        'Tuberculosis of epididymis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB epididymis-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01643',
      'LONG DESCRIPTION': 'Tuberculosis of epididymis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB epididymis-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01644',
      'LONG DESCRIPTION':
        'Tuberculosis of epididymis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB epididymis-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01645',
      'LONG DESCRIPTION':
        'Tuberculosis of epididymis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB epididymis-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01646',
      'LONG DESCRIPTION':
        'Tuberculosis of epididymis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB epididymis-oth test'
    },
    {
      'DIAGNOSIS CODE': '01650',
      'LONG DESCRIPTION': 'Tuberculosis of other male genital organs, unspecified',
      'SHORT DESCRIPTION': 'TB male genit NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01651',
      'LONG DESCRIPTION':
        'Tuberculosis of other male genital organs, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB male gen NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01652',
      'LONG DESCRIPTION':
        'Tuberculosis of other male genital organs, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB male gen NEC-ex unkn'
    },
    {
      'DIAGNOSIS CODE': '01653',
      'LONG DESCRIPTION': 'Tuberculosis of other male genital organs, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB male gen NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01654',
      'LONG DESCRIPTION':
        'Tuberculosis of other male genital organs, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB male gen NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01655',
      'LONG DESCRIPTION':
        'Tuberculosis of other male genital organs, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB male gen NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01656',
      'LONG DESCRIPTION':
        'Tuberculosis of other male genital organs, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB male gen NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01660',
      'LONG DESCRIPTION': 'Tuberculous oophoritis and salpingitis, unspecified',
      'SHORT DESCRIPTION': 'TB ovary & tube-unspec'
    },
    {
      'DIAGNOSIS CODE': '01661',
      'LONG DESCRIPTION':
        'Tuberculous oophoritis and salpingitis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB ovary & tube-no exam'
    },
    {
      'DIAGNOSIS CODE': '01662',
      'LONG DESCRIPTION':
        'Tuberculous oophoritis and salpingitis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB ovary/tube-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01663',
      'LONG DESCRIPTION': 'Tuberculous oophoritis and salpingitis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB ovary & tube-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01664',
      'LONG DESCRIPTION':
        'Tuberculous oophoritis and salpingitis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB ovary & tube-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01665',
      'LONG DESCRIPTION':
        'Tuberculous oophoritis and salpingitis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB ovary & tube-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01666',
      'LONG DESCRIPTION':
        'Tuberculous oophoritis and salpingitis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB ovary & tube-oth test'
    },
    {
      'DIAGNOSIS CODE': '01670',
      'LONG DESCRIPTION': 'Tuberculosis of other female genital organs, unspecified',
      'SHORT DESCRIPTION': 'TB female gen NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01671',
      'LONG DESCRIPTION':
        'Tuberculosis of other female genital organs, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB fem gen NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01672',
      'LONG DESCRIPTION':
        'Tuberculosis of other female genital organs, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB fem gen NEC-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01673',
      'LONG DESCRIPTION':
        'Tuberculosis of other female genital organs, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB fem gen NEC-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01674',
      'LONG DESCRIPTION':
        'Tuberculosis of other female genital organs, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB fem gen NEC-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01675',
      'LONG DESCRIPTION':
        'Tuberculosis of other female genital organs, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB fem gen NEC-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01676',
      'LONG DESCRIPTION':
        'Tuberculosis of other female genital organs, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB fem gen NEC-oth test'
    },
    {
      'DIAGNOSIS CODE': '01690',
      'LONG DESCRIPTION': 'Genitourinary tuberculosis, unspecified, unspecified',
      'SHORT DESCRIPTION': 'Gu TB NOS-unspec'
    },
    {
      'DIAGNOSIS CODE': '01691',
      'LONG DESCRIPTION':
        'Genitourinary tuberculosis, unspecified, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Gu TB NOS-no exam'
    },
    {
      'DIAGNOSIS CODE': '01692',
      'LONG DESCRIPTION':
        'Genitourinary tuberculosis, unspecified, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Gu TB NOS-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01693',
      'LONG DESCRIPTION': 'Genitourinary tuberculosis, unspecified, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Gu TB NOS-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01694',
      'LONG DESCRIPTION':
        'Genitourinary tuberculosis, unspecified, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Gu TB NOS-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01695',
      'LONG DESCRIPTION':
        'Genitourinary tuberculosis, unspecified, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Gu TB NOS-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01696',
      'LONG DESCRIPTION':
        'Genitourinary tuberculosis, unspecified, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Gu TB NOS-oth test'
    },
    {
      'DIAGNOSIS CODE': '01700',
      'LONG DESCRIPTION': 'Tuberculosis of skin and subcutaneous cellular tissue, unspecified',
      'SHORT DESCRIPTION': 'TB skin/subcutan-unspec'
    },
    {
      'DIAGNOSIS CODE': '01701',
      'LONG DESCRIPTION':
        'Tuberculosis of skin and subcutaneous cellular tissue, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB skin/subcut-no exam'
    },
    {
      'DIAGNOSIS CODE': '01702',
      'LONG DESCRIPTION':
        'Tuberculosis of skin and subcutaneous cellular tissue, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB skin/subcut-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01703',
      'LONG DESCRIPTION':
        'Tuberculosis of skin and subcutaneous cellular tissue, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB skin/subcut-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01704',
      'LONG DESCRIPTION':
        'Tuberculosis of skin and subcutaneous cellular tissue, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB skin/subcut-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01705',
      'LONG DESCRIPTION':
        'Tuberculosis of skin and subcutaneous cellular tissue, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB skin/subcut-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01706',
      'LONG DESCRIPTION':
        'Tuberculosis of skin and subcutaneous cellular tissue, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB skin/subcut-oth test'
    },
    {
      'DIAGNOSIS CODE': '01710',
      'LONG DESCRIPTION': 'Erythema nodosum with hypersensitivity reaction in tuberculosis, unspecified',
      'SHORT DESCRIPTION': 'Erythema nodos tb-unspec'
    },
    {
      'DIAGNOSIS CODE': '01711',
      'LONG DESCRIPTION':
        'Erythema nodosum with hypersensitivity reaction in tuberculosis, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'Erythem nodos tb-no exam'
    },
    {
      'DIAGNOSIS CODE': '01712',
      'LONG DESCRIPTION':
        'Erythema nodosum with hypersensitivity reaction in tuberculosis, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'Erythem nod tb-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01713',
      'LONG DESCRIPTION':
        'Erythema nodosum with hypersensitivity reaction in tuberculosis, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'Erythem nod tb-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01714',
      'LONG DESCRIPTION':
        'Erythema nodosum with hypersensitivity reaction in tuberculosis, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'Erythem nodos tb-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01715',
      'LONG DESCRIPTION':
        'Erythema nodosum with hypersensitivity reaction in tuberculosis, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'Erythem nod tb-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01716',
      'LONG DESCRIPTION':
        'Erythema nodosum with hypersensitivity reaction in tuberculosis, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'Erythem nod tb-oth test'
    },
    {
      'DIAGNOSIS CODE': '01720',
      'LONG DESCRIPTION': 'Tuberculosis of peripheral lymph nodes, unspecified',
      'SHORT DESCRIPTION': 'TB periph lymph-unspec'
    },
    {
      'DIAGNOSIS CODE': '01721',
      'LONG DESCRIPTION':
        'Tuberculosis of peripheral lymph nodes, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB periph lymph-no exam'
    },
    {
      'DIAGNOSIS CODE': '01722',
      'LONG DESCRIPTION':
        'Tuberculosis of peripheral lymph nodes, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB periph lymph-exam unk'
    },
    {
      'DIAGNOSIS CODE': '01723',
      'LONG DESCRIPTION': 'Tuberculosis of peripheral lymph nodes, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB periph lymph-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01724',
      'LONG DESCRIPTION':
        'Tuberculosis of peripheral lymph nodes, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB periph lymph-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01725',
      'LONG DESCRIPTION':
        'Tuberculosis of peripheral lymph nodes, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB periph lymph-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01726',
      'LONG DESCRIPTION':
        'Tuberculosis of peripheral lymph nodes, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB periph lymph-oth test'
    },
    {
      'DIAGNOSIS CODE': '01730',
      'LONG DESCRIPTION': 'Tuberculosis of eye, unspecified',
      'SHORT DESCRIPTION': 'TB of eye-unspec'
    },
    {
      'DIAGNOSIS CODE': '01731',
      'LONG DESCRIPTION': 'Tuberculosis of eye, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of eye-no exam'
    },
    {
      'DIAGNOSIS CODE': '01732',
      'LONG DESCRIPTION': 'Tuberculosis of eye, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of eye-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01733',
      'LONG DESCRIPTION': 'Tuberculosis of eye, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of eye-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01734',
      'LONG DESCRIPTION':
        'Tuberculosis of eye, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of eye-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01735',
      'LONG DESCRIPTION':
        'Tuberculosis of eye, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of eye-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01736',
      'LONG DESCRIPTION':
        'Tuberculosis of eye, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of eye-oth test'
    },
    {
      'DIAGNOSIS CODE': '01740',
      'LONG DESCRIPTION': 'Tuberculosis of ear, unspecified',
      'SHORT DESCRIPTION': 'TB of ear-unspec'
    },
    {
      'DIAGNOSIS CODE': '01741',
      'LONG DESCRIPTION': 'Tuberculosis of ear, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of ear-no exam'
    },
    {
      'DIAGNOSIS CODE': '01742',
      'LONG DESCRIPTION': 'Tuberculosis of ear, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of ear-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01743',
      'LONG DESCRIPTION': 'Tuberculosis of ear, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of ear-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01744',
      'LONG DESCRIPTION':
        'Tuberculosis of ear, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of ear-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01745',
      'LONG DESCRIPTION':
        'Tuberculosis of ear, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of ear-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01746',
      'LONG DESCRIPTION':
        'Tuberculosis of ear, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of ear-oth test'
    },
    {
      'DIAGNOSIS CODE': '01750',
      'LONG DESCRIPTION': 'Tuberculosis of thyroid gland, unspecified',
      'SHORT DESCRIPTION': 'TB of thyroid-unspec'
    },
    {
      'DIAGNOSIS CODE': '01751',
      'LONG DESCRIPTION': 'Tuberculosis of thyroid gland, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of thyroid-no exam'
    },
    {
      'DIAGNOSIS CODE': '01752',
      'LONG DESCRIPTION':
        'Tuberculosis of thyroid gland, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of thyroid-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01753',
      'LONG DESCRIPTION': 'Tuberculosis of thyroid gland, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of thyroid-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01754',
      'LONG DESCRIPTION':
        'Tuberculosis of thyroid gland, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of thyroid-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01755',
      'LONG DESCRIPTION':
        'Tuberculosis of thyroid gland, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of thyroid-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01756',
      'LONG DESCRIPTION':
        'Tuberculosis of thyroid gland, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of thyroid-oth test'
    },
    {
      'DIAGNOSIS CODE': '01760',
      'LONG DESCRIPTION': 'Tuberculosis of adrenal glands, unspecified',
      'SHORT DESCRIPTION': 'TB of adrenal-unspec'
    },
    {
      'DIAGNOSIS CODE': '01761',
      'LONG DESCRIPTION': 'Tuberculosis of adrenal glands, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of adrenal-no exam'
    },
    {
      'DIAGNOSIS CODE': '01762',
      'LONG DESCRIPTION':
        'Tuberculosis of adrenal glands, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of adrenal-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01763',
      'LONG DESCRIPTION': 'Tuberculosis of adrenal glands, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of adrenal-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01764',
      'LONG DESCRIPTION':
        'Tuberculosis of adrenal glands, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of adrenal-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01765',
      'LONG DESCRIPTION':
        'Tuberculosis of adrenal glands, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of adrenal-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01766',
      'LONG DESCRIPTION':
        'Tuberculosis of adrenal glands, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of adrenal-oth test'
    },
    {
      'DIAGNOSIS CODE': '01770',
      'LONG DESCRIPTION': 'Tuberculosis of spleen, unspecified',
      'SHORT DESCRIPTION': 'TB of spleen-unspec'
    },
    {
      'DIAGNOSIS CODE': '01771',
      'LONG DESCRIPTION': 'Tuberculosis of spleen, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of spleen-no exam'
    },
    {
      'DIAGNOSIS CODE': '01772',
      'LONG DESCRIPTION': 'Tuberculosis of spleen, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB of spleen-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01773',
      'LONG DESCRIPTION': 'Tuberculosis of spleen, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB of spleen-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01774',
      'LONG DESCRIPTION':
        'Tuberculosis of spleen, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB of spleen-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01775',
      'LONG DESCRIPTION':
        'Tuberculosis of spleen, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB of spleen-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01776',
      'LONG DESCRIPTION':
        'Tuberculosis of spleen, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB of spleen-oth test'
    },
    {
      'DIAGNOSIS CODE': '01780',
      'LONG DESCRIPTION': 'Tuberculosis of esophagus, unspecified',
      'SHORT DESCRIPTION': 'TB esophagus-unspec'
    },
    {
      'DIAGNOSIS CODE': '01781',
      'LONG DESCRIPTION': 'Tuberculosis of esophagus, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB esophagus-no exam'
    },
    {
      'DIAGNOSIS CODE': '01782',
      'LONG DESCRIPTION': 'Tuberculosis of esophagus, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB esophagus-exam unkn'
    },
    {
      'DIAGNOSIS CODE': '01783',
      'LONG DESCRIPTION': 'Tuberculosis of esophagus, tubercle bacilli found (in sputum) by microscopy',
      'SHORT DESCRIPTION': 'TB esophagus-micro dx'
    },
    {
      'DIAGNOSIS CODE': '01784',
      'LONG DESCRIPTION':
        'Tuberculosis of esophagus, tubercle bacilli not found (in sputum) by microscopy, but found by bacterial culture',
      'SHORT DESCRIPTION': 'TB esophagus-cult dx'
    },
    {
      'DIAGNOSIS CODE': '01785',
      'LONG DESCRIPTION':
        'Tuberculosis of esophagus, tubercle bacilli not found by bacteriological examination, but tuberculosis confirmed histologically',
      'SHORT DESCRIPTION': 'TB esophagus-histo dx'
    },
    {
      'DIAGNOSIS CODE': '01786',
      'LONG DESCRIPTION':
        'Tuberculosis of esophagus, tubercle bacilli not found by bacteriological or histological examination, but tuberculosis confirmed by other methods [inoculation of animals]',
      'SHORT DESCRIPTION': 'TB esophagus-oth test'
    },
    {
      'DIAGNOSIS CODE': '01790',
      'LONG DESCRIPTION': 'Tuberculosis of other specified organs, unspecified',
      'SHORT DESCRIPTION': 'TB of organ NEC-unspec'
    },
    {
      'DIAGNOSIS CODE': '01791',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified organs, bacteriological or histological examination not done',
      'SHORT DESCRIPTION': 'TB of organ NEC-no exam'
    },
    {
      'DIAGNOSIS CODE': '01792',
      'LONG DESCRIPTION':
        'Tuberculosis of other specified organs, bacteriological or histological examination unknown (at present)',
      'SHORT DESCRIPTION': 'TB organ NEC-exam unkn'
    }
  ]
  return res
}
