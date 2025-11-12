const normalize = (val) => val?.toLowerCase().trim()

export const GENERAL_SYMBOLS = [
  {
    id: 'single_use',
    label: 'Do not reuse / single use only',
    storage: 'Single Use',
    image: '/images/general symbols/Do not reuse single use only.png'
  },
  {
    id: 'consult_instructions',
    label: 'Consult instructions',
    storage: 'Consult Instructions',
    image: '/images/general symbols/Consult instructions.png'
  },
  {
    id: 'caution',
    label: 'Caution',
    storage: 'Caution',
    image: '/images/general symbols/Caution.png'
  },
  {
    id: 'do_not_resterilise',
    label: 'Do not resterilise',
    storage: 'Do Not Resterilise',
    image: '/images/general symbols/Do not resterilise.png'
  },
  {
    id: 'non_sterile',
    label: 'Non-sterile',
    storage: 'Non Sterile',
    image: '/images/general symbols/Non-sterile.png'
  },
  {
    id: 'damaged_package',
    label: 'Do not use if package is damaged',
    storage: 'Damaged Package',
    image: '/images/general symbols/Do not use if package is damaged.png'
  },
  {
    id: 'sterile',
    label: 'Sterile',
    storage: 'Sterile',
    image: '/images/general symbols/Sterile.png'
  },
  {
    id: 'sterile_aseptic',
    label: 'Sterilised using aseptic processing techniques',
    storage: 'Sterile A',
    image: '/images/general symbols/Sterilised using aseptic processing techniques.png'
  },
  {
    id: 'sterile_eo',
    label: 'Sterilised using ethylene oxide',
    storage: 'Sterile EO',
    image: '/images/general symbols/Sterilised using ethylene oxide.png'
  },
  {
    id: 'sterile_r',
    label: 'Sterilised using irradiation',
    storage: 'Sterile R',
    image: '/images/general symbols/Sterilised using irradiation.png'
  },
  {
    id: 'keep_away_sunlight',
    label: 'Keep away from sunlight',
    storage: 'Keep Away From Sunlight',
    image: '/images/general symbols/Keep away from sunlight.png'
  },
  {
    id: 'keep_dry',
    label: 'Keep dry',
    storage: 'Keep Dry',
    image: '/images/general symbols/Keep dry.png'
  },
  {
    id: 'temperature_limit',
    label: 'Temperature limit',
    storage: 'Temperature Limit',
    image: '/images/general symbols/Temperature limit.png'
  },
  {
    id: 'non_pyrogenic',
    label: 'Non-pyrogenic',
    storage: 'Non Pyrogenic',
    image: '/images/general symbols/Non-pyrogenic.png'
  },
  {
    id: 'medical_device',
    label: 'Medical device',
    storage: 'Medical Device',
    image: '/images/general symbols/Medical device.png'
  },
  {
    id: 'prescription_only',
    label: 'Prescription only',
    storage: 'Prescription Only',
    image: '/images/general symbols/Prescription only.png'
  },
  {
    id: 'contains_latex',
    label: 'Contains latex',
    storage: 'Contains LATEX',
    image: '/images/general symbols/Contains latex.png'
  },
  {
    id: 'no_latex',
    label: 'Does not contain latex',
    storage: 'No LATEX',
    image: '/images/general symbols/Does not contain latex.png'
  },
  {
    id: 'no_phthalates',
    label: 'Does not contain DEHP',
    storage: 'No PHT DEHP',
    image: null
  },
  {
    id: 'ce',
    label: 'CE marking',
    storage: 'CE',
    image: '/images/general symbols/CE marking.png'
  }
]

export const RECYCLING_SYMBOLS = [
  {
    id: 'recycle_general',
    label: 'General Recycling Symbol',
    storage: 'Recyclable',
    image: '/images/recycling symbols/General Recycling Symbol.png'
  },
  {
    id: 'pet_01',
    label: '01 PET(E)',
    storage: '01 PET',
    image: '/images/recycling symbols/1 PET(E).png'
  },
  {
    id: 'hdpe_02',
    label: '02 HDPE',
    storage: '02 HDPE',
    image: '/images/recycling symbols/2 HDPE.png'
  },
  {
    id: 'pvc_03',
    label: '03 PVC',
    storage: '03 PVC',
    image: '/images/recycling symbols/3 PVC.png'
  },
  {
    id: 'ldpe_04',
    label: '04 LDPE',
    storage: '04 LDPE',
    image: '/images/recycling symbols/4 LDPE.png'
  },
  {
    id: 'pp_05',
    label: '05 PP',
    storage: '05 PP',
    image: '/images/recycling symbols/5 PP.png'
  },
  {
    id: 'ps_06',
    label: '06 PS',
    storage: '06 PS',
    image: '/images/recycling symbols/6 PS.png'
  },
  {
    id: 'other_07',
    label: '07 Other Plastics',
    storage: '07 Other Plastics',
    image: '/images/recycling symbols/7 Other Plastics.png'
  },
  {
    id: 'pap_20',
    label: '20 PAP (Cardboard)',
    storage: '20 PAP',
    image: '/images/recycling symbols/20 PAP (Cardboard).png'
  },
  {
    id: 'pap_21',
    label: '21 PAP (Paperboard)',
    storage: '21 PAP',
    image: '/images/recycling symbols/21 PAP (Paperboard).png'
  },
  {
    id: 'pap_22',
    label: '22 PAP (Paper)',
    storage: '22 PAP',
    image: '/images/recycling symbols/22 PAP (Paper).png'
  },
  {
    id: 'other',
    label: 'Other',
    storage: 'Other',
    image: null
  }
]

const toIdArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

export const parseSymbolField = (value, options) => {
  const rawValues = toIdArray(value)
  return rawValues.map((raw) => {
    const match = options.find((opt) => {
      const storageMatch = normalize(opt.storage) === normalize(raw)
      const labelMatch = normalize(opt.label) === normalize(raw)
      const idMatch = normalize(opt.id) === normalize(raw)
      return storageMatch || labelMatch || idMatch
    })
    return match ? match.id : raw
  })
}

export const serializeSymbolField = (values, options) => {
  if (!values) return ''
  const arr = Array.isArray(values) ? values : [values]

  const storageValues = arr
    .map((val) => {
      const match = options.find((opt) => normalize(opt.id) === normalize(val))
      if (match) {
        return match.storage
      }
      return typeof val === 'string' ? val.trim() : ''
    })
    .filter(Boolean)

  return storageValues.join(', ')
}

