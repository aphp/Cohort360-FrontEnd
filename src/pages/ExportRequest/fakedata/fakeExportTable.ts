export const fakeExportTable = [
  {
    name: 'person',
    canBeExported: true,
    fhirReference: 'Patient',
    isOmopStandard: true,
    isFhirStandard: false,
    parentTable: null,
    tableClassification: 'Fact',
    columns: [
      {
        name: 'person_id',
        columnType: null,
        fieldCategory: {}
      },
      {
        name: 'person_source_value',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'location_id',
        primaryKey: {
          name: 'location_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'provider_id',
        primaryKey: {
          name: 'provider_id',
          columnType: null,
          fieldCategory: {}
        },
        isNullable: true,
        foreignDataCategory: {}
      },
      {
        name: 'care_site_id',
        primaryKey: {
          name: 'care_site_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'year_of_birth',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'month_of_birth',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'day_of_birth',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'birth_datetime',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'death_datetime',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'race_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'race_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'race_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'ethnicity_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'ethnicity_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'ethnicity_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'gender_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'gender_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'gender_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'status_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'status_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'status_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'cdm_source',
        columnType: null,
        isNullable: true
      }
    ]
  },
  {
    name: 'procedure_occurrence',
    canBeExported: true,
    fhirReference: 'Procedure',
    isOmopStandard: true,
    isFhirStandard: false,
    parentTable: null,
    tableClassification: 'Fact',
    columns: [
      {
        name: 'procedure_occurrence_id',
        columnType: null,
        fieldCategory: {}
      },
      {
        name: 'person_id',
        primaryKey: {
          name: 'person_id',
          columnType: null,
          fieldCategory: {}
        },
        isNullable: true,
        foreignDataCategory: {}
      },
      {
        name: 'visit_occurrence_id',
        primaryKey: {
          name: 'visit_occurrence_id',
          columnType: null,
          fieldCategory: {}
        },
        isNullable: true,
        foreignDataCategory: {}
      },
      {
        name: 'visit_detail_id',
        primaryKey: {
          name: 'visit_detail_id',
          columnType: null,
          fieldCategory: {}
        },
        isNullable: true,
        foreignDataCategory: {}
      },
      {
        name: 'provider_id',
        primaryKey: {
          name: 'provider_id',
          columnType: null,
          fieldCategory: {}
        },
        isNullable: true,
        foreignDataCategory: {}
      },
      {
        name: 'procedure_date',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'procedure_datetime',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'procedure_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'procedure_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'procedure_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'procedure_type_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'procedure_type_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'procedure_type_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'modifier_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'modifier_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'quantity',
        columnType: null,
        isNullable: true
      },
      {
        name: 'row_status_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'row_status_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'row_status_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'cdm_source',
        columnType: null,
        isNullable: true
      }
    ]
  },
  {
    name: 'condition_occurrence',
    canBeExported: true,
    fhirReference: 'Condition',
    isOmopStandard: true,
    isFhirStandard: false,
    parentTable: null,
    tableClassification: 'Fact',
    columns: [
      {
        name: 'condition_occurrence_id',
        columnType: null,
        fieldCategory: {}
      },
      {
        name: 'person_id',
        primaryKey: {
          name: 'person_id',
          columnType: null,
          fieldCategory: {}
        },
        isNullable: true,
        foreignDataCategory: {}
      },
      {
        name: 'visit_occurrence_id',
        primaryKey: {
          name: 'visit_occurrence_id',
          columnType: null,
          fieldCategory: {}
        },
        isNullable: true,
        foreignDataCategory: {}
      },
      {
        name: 'visit_detail_id',
        primaryKey: {
          name: 'visit_detail_id',
          columnType: null,
          fieldCategory: {}
        },
        isNullable: true,
        foreignDataCategory: {}
      },
      {
        name: 'provider_id',
        primaryKey: {
          name: 'provider_id',
          columnType: null,
          fieldCategory: {}
        },
        isNullable: true,
        foreignDataCategory: {}
      },
      {
        name: 'condition_start_date',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'condition_start_datetime',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'condition_end_date',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'condition_end_datetime',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'condition_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'condition_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'condition_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'condition_type_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'condition_type_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'condition_type_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'condition_status_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'condition_status_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'condition_status_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'stop_reason',
        columnType: null,
        isNullable: true,
        fieldCategory: {}
      },
      {
        name: 'row_status_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'row_status_source_value',
        columnType: null,
        isNullable: true
      },
      {
        name: 'row_status_source_concept_id',
        primaryKey: {
          name: 'concept_id',
          columnType: null
        },
        isNullable: true
      },
      {
        name: 'cdm_source',
        columnType: null,
        isNullable: true
      }
    ]
  }
]

export const fakeCohortList = [
  {
    uuid: '7f5febcc-5796-4b2e-b4ac-c9700db3fd31',
    owner: '7017143',
    result_size: 10383,
    request: 'acaa1af6-28c7-42f9-ae69-92aab9533ce8',
    request_query_snapshot: 'df5793e0-3ff1-44fb-ac70-bdc0fa33b995',
    dated_measure: {
      uuid: '71f3aa91-e7c4-4158-b8a3-74bb9f4e5e91',
      owner: '7017143',
      request_query_snapshot: 'df5793e0-3ff1-44fb-ac70-bdc0fa33b995',
      count_outdated: true,
      cohort_limit: 15000,
      deleted: null,
      deleted_by_cascade: false,
      request_job_id: 'a13c595f-3dfb-49fc-b9e8-f198629f12ea',
      request_job_status: 'finished',
      request_job_fail_msg: null,
      request_job_duration: '0:00:28.369153',
      created_at: '2024-07-12T09:21:11.313939Z',
      modified_at: '2024-07-12T09:23:03.833445Z',
      fhir_datetime: null,
      measure: 10383,
      measure_min: null,
      measure_max: null,
      count_task_id: '5e67e09e-a6cc-49a4-85a6-49cc313937b5',
      mode: 'Snapshot'
    },
    dated_measure_global: null,
    group_id: '20000491',
    exportable: true,
    deleted: null,
    deleted_by_cascade: false,
    request_job_id: 'adc56a83-1bd5-4b39-b4d5-baec3a484472',
    request_job_status: 'finished',
    request_job_fail_msg: null,
    request_job_duration: '0:01:09.361196',
    created_at: '2024-07-12T09:21:54.469954Z',
    modified_at: '2024-09-30T07:57:40.008087Z',
    name: 'cohort de biologie',
    description: '',
    favorite: true,
    create_task_id: '15389636-e1fe-4713-8ba6-272bfa2bc8ca',
    type: 'MY_COHORTS',
    is_subset: false
  },
  {
    uuid: '2dca211a-dbf1-4adc-b5e9-47c924956e72',
    owner: '7017143',
    result_size: 74,
    request: 'cc53f4fa-6ca3-4267-ad15-b69f3a49546a',
    request_query_snapshot: '70588ac5-92b6-4eb9-aaf8-a7527961787f',
    dated_measure: {
      uuid: 'a679cd41-1a89-4333-a556-cd910d8badfa',
      owner: '7017143',
      request_query_snapshot: '70588ac5-92b6-4eb9-aaf8-a7527961787f',
      count_outdated: true,
      cohort_limit: 15000,
      deleted: null,
      deleted_by_cascade: false,
      request_job_id: '157c19c0-6864-45b2-976a-1dd887ff1607',
      request_job_status: 'finished',
      request_job_fail_msg: null,
      request_job_duration: '0:00:23.369131',
      created_at: '2024-07-02T14:46:57.797071Z',
      modified_at: '2024-07-02T14:48:27.522022Z',
      fhir_datetime: null,
      measure: 74,
      measure_min: null,
      measure_max: null,
      count_task_id: '64352dfc-0241-413f-a3e1-f3c8d597e629',
      mode: 'Snapshot'
    },
    dated_measure_global: null,
    group_id: '20000408',
    exportable: true,
    deleted: null,
    deleted_by_cascade: false,
    request_job_id: '76ed831a-ec16-4b94-8844-0a53f3bcc9d0',
    request_job_status: 'finished',
    request_job_fail_msg: null,
    request_job_duration: '0:00:47.032047',
    created_at: '2024-07-02T14:47:40.488343Z',
    modified_at: '2024-07-02T14:48:27.528701Z',
    name: 'medicament et pmsi 100 occurence',
    description: '',
    favorite: false,
    create_task_id: '6cb64f85-ce0c-4ac7-9c00-4e696ae8a607',
    type: 'MY_COHORTS',
    is_subset: false
  },
  {
    uuid: 'c71c6ad8-3d6d-4657-b4c9-3d0643b380c6',
    owner: '7017143',
    result_size: 436,
    request: 'cc53f4fa-6ca3-4267-ad15-b69f3a49546a',
    request_query_snapshot: '2d2d3fce-6022-40b2-81d4-548b52a20d64',
    dated_measure: {
      uuid: 'bbd4fe80-f4c3-4ef0-88e6-af713530162b',
      owner: '7017143',
      request_query_snapshot: '2d2d3fce-6022-40b2-81d4-548b52a20d64',
      count_outdated: true,
      cohort_limit: 15000,
      deleted: null,
      deleted_by_cascade: false,
      request_job_id: '05a114fe-f3ae-472a-86be-1ff34a712ca5',
      request_job_status: 'finished',
      request_job_fail_msg: null,
      request_job_duration: '0:00:14.933803',
      created_at: '2024-07-02T09:25:45.429067Z',
      modified_at: '2024-07-02T09:27:24.904658Z',
      fhir_datetime: null,
      measure: 436,
      measure_min: null,
      measure_max: null,
      count_task_id: '4074c41b-3bff-42a6-a2a7-1612b1e97389',
      mode: 'Snapshot'
    },
    dated_measure_global: null,
    group_id: '20000407',
    exportable: true,
    deleted: null,
    deleted_by_cascade: false,
    request_job_id: 'a0678eb2-6a88-48cf-bab4-85321a81028f',
    request_job_status: 'finished',
    request_job_fail_msg: null,
    request_job_duration: '0:01:04.118796',
    created_at: '2024-07-02T09:26:20.784497Z',
    modified_at: '2024-07-02T09:27:24.911549Z',
    name: 'cohort Medicament',
    description: '',
    favorite: false,
    create_task_id: '331f3840-1685-46a2-a872-d17e93621dd7',
    type: 'MY_COHORTS',
    is_subset: false
  },
  {
    uuid: '728912f2-be03-47f3-bd95-7cc3d580a4b9',
    owner: '7017143',
    result_size: 5841,
    request: 'cad56590-2c97-44ba-abdf-11371ac5938c',
    request_query_snapshot: '2311d6fc-279d-4386-aa3d-825922c24d6b',
    dated_measure: {
      uuid: '9c87a620-822c-4d4b-99c6-ef8bf074b7aa',
      owner: '7017143',
      request_query_snapshot: '2311d6fc-279d-4386-aa3d-825922c24d6b',
      count_outdated: true,
      cohort_limit: 15000,
      deleted: null,
      deleted_by_cascade: false,
      request_job_id: 'f06e73ad-3512-4509-9970-b532f4152bb1',
      request_job_status: 'finished',
      request_job_fail_msg: null,
      request_job_duration: '0:00:02.256770',
      created_at: '2024-06-19T12:53:55.086016Z',
      modified_at: '2024-06-19T12:56:32.962979Z',
      fhir_datetime: null,
      measure: 5841,
      measure_min: null,
      measure_max: null,
      count_task_id: '2665397e-db1f-455e-9760-81a7073ce154',
      mode: 'Snapshot'
    },
    dated_measure_global: {
      uuid: '40783da3-aae9-4cc8-97af-42ef6dfa9ff7',
      owner: '7017143',
      request_query_snapshot: '2311d6fc-279d-4386-aa3d-825922c24d6b',
      count_outdated: true,
      cohort_limit: 15000,
      deleted: null,
      deleted_by_cascade: false,
      request_job_id: '9363344c-9c99-44fc-a19d-7edcef299bd4',
      request_job_status: 'finished',
      request_job_fail_msg: null,
      request_job_duration: '0:00:04.370086',
      created_at: '2024-06-19T12:54:19.218733Z',
      modified_at: '2024-06-19T12:54:23.591560Z',
      fhir_datetime: null,
      measure: null,
      measure_min: 17674,
      measure_max: 17743,
      count_task_id: 'ba8209fd-2c57-4c11-bf73-7133e4eb07b7',
      mode: 'Global'
    },
    group_id: '20000326',
    exportable: true,
    deleted: null,
    deleted_by_cascade: false,
    request_job_id: '95a1f2be-b74b-492e-bc50-761976db0b64',
    request_job_status: 'finished',
    request_job_fail_msg: null,
    request_job_duration: '0:00:27.301847',
    created_at: '2024-06-19T12:54:19.227881Z',
    modified_at: '2024-06-19T12:54:46.539737Z',
    name: 'test cohort via web socket',
    description: '',
    favorite: false,
    create_task_id: '5e4a6a42-e2f4-4814-b7d2-3ae617a89f39',
    type: 'MY_COHORTS',
    is_subset: false
  },
  {
    uuid: 'edae4509-dd8f-47e0-965f-dbb593d3251d',
    owner: '7017143',
    result_size: 1851,
    request: 'c7fa29dc-221f-4dc8-87cc-a7ac786d1c8c',
    request_query_snapshot: '0cef328c-9071-448a-8fe8-e02b620370ee',
    dated_measure: {
      uuid: 'c58dec16-1e59-4dda-8638-107185ea9c7c',
      owner: '7017143',
      request_query_snapshot: '0cef328c-9071-448a-8fe8-e02b620370ee',
      count_outdated: true,
      cohort_limit: 15000,
      deleted: null,
      deleted_by_cascade: false,
      request_job_id: 'd921561d-2223-4b57-a096-bc247d9e38c7',
      request_job_status: 'finished',
      request_job_fail_msg: null,
      request_job_duration: '0:00:00.256275',
      created_at: '2024-06-11T14:32:14.043252Z',
      modified_at: '2024-06-11T14:32:52.341048Z',
      fhir_datetime: null,
      measure: 1851,
      measure_min: null,
      measure_max: null,
      count_task_id: '4a5ee64c-f671-40f2-95df-29e78fb85f64',
      mode: 'Snapshot'
    },
    dated_measure_global: null,
    group_id: '20000213',
    exportable: true,
    deleted: null,
    deleted_by_cascade: false,
    request_job_id: 'b388e967-0024-46d8-9806-643225a9e285',
    request_job_status: 'finished',
    request_job_fail_msg: null,
    request_job_duration: '0:00:26.033793',
    created_at: '2024-06-11T14:32:26.305919Z',
    modified_at: '2024-06-11T14:32:52.348473Z',
    name: 'cohorte dos',
    description: '',
    favorite: false,
    create_task_id: 'c60e6e34-a8c8-459b-bdfa-28770b0330b6',
    type: 'MY_COHORTS',
    is_subset: false
  },
  {
    uuid: '376478fd-d20a-4d41-86a2-af290a42ddac',
    owner: '7017143',
    result_size: 22,
    request: 'debe50cb-5d63-446e-b94b-75be36b52bd9',
    request_query_snapshot: 'e4ff2e72-324f-4975-890a-76a40b4e3dcb',
    dated_measure: {
      uuid: '021e2415-6f02-40f0-be50-91157acef791',
      owner: '7017143',
      request_query_snapshot: 'e4ff2e72-324f-4975-890a-76a40b4e3dcb',
      count_outdated: true,
      cohort_limit: 15000,
      deleted: null,
      deleted_by_cascade: false,
      request_job_id: '049ec484-6028-4493-9057-7512f5f99864',
      request_job_status: 'finished',
      request_job_fail_msg: null,
      request_job_duration: '0:00:00.265974',
      created_at: '2024-06-11T14:31:25.567583Z',
      modified_at: '2024-06-11T14:31:59.779714Z',
      fhir_datetime: null,
      measure: 22,
      measure_min: null,
      measure_max: null,
      count_task_id: '3e544d23-3138-4a95-8f8b-9cb44af7e60a',
      mode: 'Snapshot'
    },
    dated_measure_global: null,
    group_id: '20000212',
    exportable: true,
    deleted: null,
    deleted_by_cascade: false,
    request_job_id: 'b0e31a66-9d79-4656-835a-a395e887b9d5',
    request_job_status: 'finished',
    request_job_fail_msg: null,
    request_job_duration: '0:00:15.604952',
    created_at: '2024-06-11T14:31:44.173016Z',
    modified_at: '2024-06-11T14:31:59.785845Z',
    name: 'cohorte uno',
    description: '',
    favorite: false,
    create_task_id: '6d7f356c-74f2-4b61-b96a-9cf93afe1cb2',
    type: 'MY_COHORTS',
    is_subset: false
  },
  {
    uuid: 'c6ffe687-5ff3-4ce6-8c3b-06479d5471e5',
    owner: '7017143',
    request: null,
    request_query_snapshot: null,
    dated_measure: null,
    dated_measure_global: null,
    group_id: '',
    deleted: null,
    deleted_by_cascade: false,
    request_job_id: null,
    request_job_status: 'failed',
    request_job_fail_msg: 'Expecting property name enclosed in double quotes: line 1 column 2 (char 1)',
    request_job_duration: null,
    created_at: '2024-04-24T07:50:59.850052Z',
    modified_at: '2024-04-24T07:51:00.009164Z',
    name: 'None_20000019',
    description: null,
    favorite: false,
    create_task_id: '494d3354-fdb3-4069-83cf-9e56074de9e3',
    type: 'MY_COHORTS',
    is_subset: false
  },
  {
    uuid: 'c4fcd56d-07bc-4a99-9631-f4af46f522bf',
    owner: '7017143',
    request: null,
    request_query_snapshot: null,
    dated_measure: null,
    dated_measure_global: null,
    group_id: '',
    deleted: null,
    deleted_by_cascade: false,
    request_job_id: null,
    request_job_status: 'failed',
    request_job_fail_msg: 'Expecting property name enclosed in double quotes: line 1 column 2 (char 1)',
    request_job_duration: null,
    created_at: '2024-04-24T07:38:47.379564Z',
    modified_at: '2024-04-24T07:38:47.604390Z',
    name: 'None_20000019',
    description: null,
    favorite: false,
    create_task_id: 'dce2defe-c32c-4bb0-917c-78fcbe701fbe',
    type: 'MY_COHORTS',
    is_subset: false
  }
]

export const fakeFilterList = [
  {
    uuid: '34de0bca-9afe-492b-aa16-a348e54c2621',
    owner: 'Salah BOUYAHIA (7017143)',
    deleted: null,
    deleted_by_cascade: false,
    created_at: '2024-06-04T11:53:44.207720Z',
    modified_at: '2024-06-04T11:53:44.207727Z',
    fhir_resource: 'Condition',
    fhir_version: '4.0',
    query_version: 'v1.4.4',
    name: 'test hicham cim10',
    filter: 'code=https%3A%2F%2Fsmt.esante.gouv.fr%2Fterminologie-cim-10%2F%7CZ719&source=ORBIS',
    auto_generated: false
  },
  {
    uuid: '5b3517dc-b7ca-4e21-892f-b0a47eae58a0',
    owner: 'Salah BOUYAHIA (7017143)',
    deleted: null,
    deleted_by_cascade: false,
    created_at: '2024-05-22T12:33:53.793993Z',
    modified_at: '2024-05-22T12:33:53.793999Z',
    fhir_resource: 'Condition',
    fhir_version: '4.0',
    query_version: 'v1.4.4',
    name: 'test sous cohort cim10',
    filter:
      'orbis-status=https%253A%252F%252Fterminology.eds.aphp.fr%252Faphp-orbis-condition-status%257Cdas&code=https%3A%2F%2Fsmt.esante.gouv.fr%2Fterminologie-cim-10%2F%7CZ1351&source=AREM&encounter.encounter-care-site=8312041808',
    auto_generated: false
  },
  {
    uuid: 'b2ec88e4-41c8-499a-a8b7-84c15a0f2583',
    owner: 'Salah BOUYAHIA (7017143)',
    deleted: null,
    deleted_by_cascade: false,
    created_at: '2024-04-09T13:10:34.896002Z',
    modified_at: '2024-04-09T13:10:34.896009Z',
    fhir_resource: 'Condition',
    fhir_version: '4.0',
    query_version: 'v1.4.4',
    name: "zxvlkzsmcx;kvlzmxc'lkbmzx;clkbm",
    filter: 'source=AREM',
    auto_generated: false
  },
  {
    uuid: '677c3676-94d6-4b96-a2a5-a7a3b18d8053',
    owner: 'Salah BOUYAHIA (7017143)',
    deleted: null,
    deleted_by_cascade: false,
    created_at: '2024-04-09T12:18:58.697825Z',
    modified_at: '2024-04-09T13:08:27.777918Z',
    fhir_resource: 'Condition',
    fhir_version: '4.0',
    query_version: 'v1.4.4',
    name: 'je test la source arem',
    filter: '_text=tesst&source=ORBIS',
    auto_generated: false
  },
  {
    uuid: '93dbf6b0-b081-46d2-b513-d1358ce920ba',
    owner: 'Salah BOUYAHIA (7017143)',
    deleted: null,
    deleted_by_cascade: false,
    created_at: '2024-04-09T12:17:08.537733Z',
    modified_at: '2024-04-09T12:17:08.537739Z',
    fhir_resource: 'Condition',
    fhir_version: '4.0',
    query_version: 'v1.4.4',
    name: 'wefawdf',
    filter: 'source=AREM',
    auto_generated: false
  },
  {
    uuid: 'bcdf1e9b-e4c1-4817-a38f-31dd82537ea9',
    owner: 'Salah BOUYAHIA (7017143)',
    deleted: null,
    deleted_by_cascade: false,
    created_at: '2024-03-28T18:22:26.330990Z',
    modified_at: '2024-03-28T18:22:26.330996Z',
    fhir_resource: 'Condition',
    fhir_version: '4.0',
    query_version: 'v1.4.4',
    name: 'bandiedfg',
    filter:
      'orbis-status=https%253A%252F%252Fterminology.eds.aphp.fr%252Faphp-orbis-condition-status%257Cdas&code=https%3A%2F%2Fterminology.eds.aphp.fr%2Faphp-orbis-cim10%7CE1198',
    auto_generated: false
  }
]
