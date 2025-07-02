# ValueSet and CodeSystem URL Separation Specification

## Table of Contents
1. [Problem Statement](#problem-statement)
2. [Configuration Analysis](#configuration-analysis)
3. [Technical Requirements](#technical-requirements)
4. [Detailed Implementation Plan](#detailed-implementation-plan)
5. [API Changes](#api-changes)
6. [File Modifications](#file-modifications)
7. [Migration Strategy](#migration-strategy)
8. [Testing Plan](#testing-plan)

## Problem Statement

### Background
The FHIR server API has introduced a breaking change where ValueSet URLs and CodeSystem URLs are now treated as separate entities:

- **Before**: ValueSet URL and CodeSystem URL were the same
- **After**: ValueSet URL is used for searching/listing valuesets, CodeSystem URL is used for individual codes within those valuesets

### Current Issues
1. All service functions in `serviceValueSets.ts` use the same URL for both operations
2. No mechanism exists to reverse-lookup a ValueSet from a Code + CodeSystem combination
3. Configuration only stores a single URL per valueset
4. Multiple files throughout the codebase assume URL equivalence

### Goals
1. Separate ValueSet URLs from CodeSystem URLs in configuration
2. Update all API calls to use appropriate URL types
3. Implement reverse lookup: Code + CodeSystem → ValueSet
4. Maintain backward compatibility during transition
5. Ensure all medical terminologies (ATC, UCD, LOINC, ANABIO, CIM10, CCAM, GHM) work correctly

## Configuration Analysis

### Current Configuration Files

#### ValueSet URLs (public/config.dev2.json)
Contains ValueSet URLs (currently as simple names):
```json
{
  "features": {
    "medication": {
      "valueSets": {
        "medicationAtc": { "url": "ATC" },
        "medicationUcd": { "url": "SMT - Medicament - UCD" }
      }
    },
    "condition": {
      "valueSets": {
        "conditionHierarchy": { "url": "ATIH - CIM10" }
      }
    },
    "observation": {
      "valueSets": {
        "biologyHierarchyAnabio": { "url": "APHP - ITM - ANABIO" },
        "biologyHierarchyLoinc": { "url": "APHP - ITM - LOINC" }
      }
    }
  }
}
```

#### CodeSystem URLs (public/config.newcodesystem.json)
Contains CodeSystem URLs (proper FHIR URLs):
```json
{
  "features": {
    "medication": {
      "valueSets": {
        "medicationAtc": { "url": "https://terminology.eds.aphp.fr/atc" },
        "medicationUcd": { "url": "https://terminology.eds.aphp.fr/smt-medicament-ucd" }
      }
    },
    "condition": {
      "valueSets": {
        "conditionHierarchy": { "url": "https://smt.esante.gouv.fr/terminologie-cim-10/" }
      }
    },
    "observation": {
      "valueSets": {
        "biologyHierarchyAnabio": { "url": "https://terminology.eds.aphp.fr/aphp-itm-anabio" },
        "biologyHierarchyLoinc": { "url": "https://terminology.eds.aphp.fr/aphp-itm-loinc" }
      }
    }
  }
}
```

### Target Configuration Structure
Merge both configurations into a unified structure:
```json
{
  "features": {
    "medication": {
      "valueSets": {
        "medicationAtc": { 
          "url": "ATC",
          "codeSystemUrls": ["https://terminology.eds.aphp.fr/atc"]
        }
      }
    }
  }
}

## Technical Requirements

### New Type Definitions

#### ValueSetConfig Update
```typescript
// Current
type ValueSetConfig = {
  url: string           // Used for both valueset and codesystem
  title?: string
  data?: LabelObject[]
}

// New
type ValueSetConfig = {
  url: string              // ValueSet URL (for searching/listing)
  codeSystemUrls: string[] // Array of CodeSystem URLs (for individual codes)
  title?: string
  data?: LabelObject[]
}
```

#### Reference Type Update
```typescript
// Current
export type Reference = {
  id: References
  label: string
  title: string
  standard: boolean
  url: string           // Used for both valueset and codesystem
  checked: boolean
  isHierarchy: boolean
  joinDisplayWithCode: boolean
  joinDisplayWithSystem: boolean
  filterRoots?: <T>(code: Hierarchy<T>) => boolean
}

// New
export type Reference = {
  id: References
  label: string
  title: string
  standard: boolean
  url: string              // ValueSet URL
  codeSystemUrls: string[] // Array of CodeSystem URLs
  checked: boolean
  isHierarchy: boolean
  joinDisplayWithCode: boolean
  joinDisplayWithSystem: boolean
  filterRoots?: <T>(code: Hierarchy<T>) => boolean
}
```

### Updated FhirItem Type
```typescript
// Current
export type FhirItem = {
  id: string
  label: string
  parentIds?: string[]
  childrenIds?: string[]
  system: string           // CodeSystem URL
  statTotal?: number
  statTotalUnique?: number
}

// New - CRITICAL CHANGE
export type FhirItem = {
  id: string
  label: string
  parentIds?: string[]
  childrenIds?: string[]
  system: string           // CodeSystem URL (for individual code identification)
  valueSetUrl?: string     // ValueSet URL (for grouping and API calls)
  statTotal?: number
  statTotalUnique?: number
}
```

### New Utility Types
```typescript
// For reverse lookup functionality
export type CodeSystemToValueSetMap = Record<string, string>
export type ValueSetToCodeSystemMap = Record<string, string>
```

## Detailed Implementation Plan

### Phase 1: Core Type Updates

#### Files to Update:
1. **src/config.tsx**
   - Update `ValueSetConfig` type definition
   - Add `codeSystemUrl` field to all valueset configurations

2. **src/types/valueSet.ts**
   - Update `Reference` type definition
   - Add utility types for reverse lookup

### Phase 2: Service Layer Updates

#### Files to Update:
1. **src/services/aphp/serviceValueSets.ts**

**Function Updates:**

##### `searchInValueSets()` ✅ Parameter Rename for Clarity
```typescript
// Current signature (uses correct URLs but misleading parameter name)
export const searchInValueSets = async (
  codeSystems: string[],  // Misleading name - these are actually ValueSet URLs
  search: string,
  offset?: number,
  count?: number,
  sorting?: ValueSetSorting,
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>>

// Updated signature (rename parameter for clarity)
export const searchInValueSets = async (
  valueSetUrls: string[],  // Renamed for clarity - these are ValueSet URLs
  search: string,
  offset?: number,
  count?: number,
  sorting?: ValueSetSorting,
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>>

// API call: `/ValueSet/$expand?url=${valueSetUrls.join(',')}`
// Only parameter name changes - functionality remains the same
```

##### `getChildrenFromCodes()` ⚠️ BREAKING CHANGE
```typescript
// Current signature
export const getChildrenFromCodes = async (
  codeSystem: string,  // Currently expects CodeSystem URL
  codes: string[],
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>>

// NEW signature - BREAKING CHANGE
export const getChildrenFromCodes = async (
  valueSetUrl: string,  // Now expects ValueSet URL instead!
  codes: string[],
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>>

// API call changes:
// OLD: url: codeSystem (CodeSystem URL in ValueSet resource)
// NEW: url: valueSetUrl (ValueSet URL in ValueSet resource)

// IMPORTANT: This means code expansion operations now use ValueSet URLs
// The server will handle mapping from ValueSet to the constituent CodeSystems

// CodeSystem Detection:
// - Extract from FhirItem.system field when available (from server response)
// - Fallback to first codeSystemUrl from config when system unavailable
// - Add TODO comment explaining need for better detection

// ValueSet URL Population:
// - Service must populate FhirItem.valueSetUrl field on all returned items
// - Use the valueSetUrl parameter passed to the function
// - Critical for proper grouping in hierarchy components
```

##### `getCodeList()` ✅ Parameter Rename for Clarity
```typescript
// Current signature (uses correct URLs but misleading parameter name)
export const getCodeList = async (
  codeSystem: string,  // Misleading name - actually uses ValueSet URLs
  codeInLabel = false,
  signal?: AbortSignal
): Promise<Back_API_Response<FhirItem>>

// Updated signature (rename parameter for clarity)
export const getCodeList = async (
  valueSetUrl: string,  // Renamed for clarity - this is a ValueSet URL
  codeInLabel = false,
  signal?: AbortSignal
): Promise<Back_API_Response<FhirItem>>

// API call changes:
// OLD: `/ValueSet?reference=${codeSystem}`
// NEW: `/ValueSet?url=${valueSetUrl}`
// Both parameter name AND API call change from reference= to url=
```

##### `getHierarchyRoots()` ✅ Parameter Rename for Clarity
```typescript
// Current signature (uses correct URLs but misleading parameter name)
export const getHierarchyRoots = async (
  codeSystem: string,     // Misleading name - actually uses ValueSet URLs
  valueSetTitle: string,
  filterRoots: (code: Hierarchy<FhirItem>) => boolean = () => true,
  filterOut: (code: Hierarchy<FhirItem>) => boolean = (value: Hierarchy<FhirItem>) => value.id === 'APHP generated',
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>>

// Updated signature (rename parameter for clarity)
export const getHierarchyRoots = async (
  valueSetUrl: string,    // Renamed for clarity - this is a ValueSet URL
  valueSetTitle: string,
  filterRoots: (code: Hierarchy<FhirItem>) => boolean = () => true,
  filterOut: (code: Hierarchy<FhirItem>) => boolean = (value: Hierarchy<FhirItem>) => value.id === 'APHP generated',
  signal?: AbortSignal
): Promise<Back_API_Response<Hierarchy<FhirItem>>>

// API call changes:
// OLD: `/ValueSet?only-roots=true&reference=${codeSystem}`
// NEW: `/ValueSet?only-roots=true&url=${valueSetUrl}`
// Both parameter name AND API call change from reference= to url=
```

#### New Utility Functions
```typescript
// Add reverse lookup functionality
export const getValueSetFromCodeSystem = (codeSystemUrl: string): string | undefined => {
  // Implementation to find valueset URL from codesystem URL
}

export const getCodeSystemFromValueSet = (valueSetUrl: string): string | undefined => {
  // Implementation to find codesystem URL from valueset URL  
}
```

### Phase 3: Configuration Updates

#### Files to Update:
1. **src/config.tsx**

**Add codeSystemUrl to all ValueSetConfig objects:**

```typescript
// Example updates needed:
observation: {
  enabled: true,
  valueSets: {
    biologyHierarchyAnabio: { 
      url: 'https://terminology.eds.aphp.fr/fhir/ValueSet/anabio-hierarchy',
      codeSystemUrl: 'https://terminology.eds.aphp.fr/fhir/CodeSystem/anabio',
      title: 'ANABIO' 
    },
    biologyHierarchyLoinc: { 
      url: 'https://terminology.eds.aphp.fr/fhir/ValueSet/loinc-hierarchy',
      codeSystemUrl: 'http://loinc.org',
      title: 'LOINC' 
    }
  }
},
medication: {
  enabled: true,
  valueSets: {
    medicationAtc: { 
      url: 'https://terminology.eds.aphp.fr/fhir/ValueSet/atc-hierarchy',
      codeSystemUrl: 'http://www.whocc.no/atc',
      title: 'ATC' 
    },
    medicationUcd: { 
      url: 'https://terminology.eds.aphp.fr/fhir/ValueSet/ucd-codes',
      codeSystemUrl: 'https://terminology.eds.aphp.fr/fhir/CodeSystem/ucd',
      title: 'UCD' 
    }
    // ... continue for all medication valuesets
  }
},
// ... continue for all other domains
```

**Note**: Actual URLs will need to be determined based on server configuration.

### Phase 4: Utility Function Updates

#### Files to Update:
1. **src/utils/valueSets.ts**

**Functions requiring updates:**
- `getValueSetsFromSystems()` - Update to handle both URL types
- `isDisplayedWithCode()` - May need updates for new Reference structure  
- `isDisplayedWithSystem()` - May need updates for new Reference structure
- `getLabelFromCode()` - May need updates for reverse lookup
- `getFullLabelFromCode()` - May need updates for reverse lookup

### Phase 5: State Management Updates

#### Files to Update:
1. **src/state/valueSets.ts**

**Updates needed:**
- Update Redux store to handle both URL types in cache keys
- Modify initialization logic to use correct URL types
- Update cache key generation to distinguish contexts
- Update async thunks to pass appropriate URL types

### Phase 6: Component Integration Updates

#### Files to Update:
Based on analysis, these files call serviceValueSets functions:

1. **src/utils/cohortCreation.ts**
   - `getChildrenFromCodes()` calls - line 541, 579
   - Update to pass codeSystemUrl instead of system

2. **src/mappers/filters.ts**
   - Any calls to valueset services need URL type updates

3. **src/hooks/valueSet/useSearchValueSet.ts**
   - `searchInValueSets()` calls need valueSetUrl updates

4. **src/utils/exploration.ts**
   - Any valueset service calls need URL updates

5. **src/components/ExplorationBoard/config/imaging.ts**
   - Valueset configuration usage

6. **src/components/ExplorationBoard/config/medication.ts**
   - Valueset configuration usage

7. **src/components/Patient/PatientTimeline/PatientTimeline.tsx**
   - Any valueset service calls

8. **src/state/valueSets.ts**
   - Update all service calls to use appropriate URL types

## API Changes

### Current API Usage Patterns
```typescript
// Search in valuesets (uses valueset URLs)
GET /ValueSet/$expand?url=${urls.join(',')}&filter=${search}

// Get code list (uses codesystem URLs - WRONG!)
GET /ValueSet?reference=${url}

// Get hierarchy roots (uses codesystem URLs - WRONG!)
GET /ValueSet?only-roots=true&reference=${url}

// Expand codes (uses codesystem URLs - WRONG!)
POST /ValueSet/$expand
{
  "resourceType": "ValueSet",
  "url": codeSystemUrl,  // Currently uses codesystem URL
  "compose": {
    "include": [
      {
        "filter": [...]
      }
    ]
  }
}
```

### New API Usage Patterns
```typescript
// Search operations - use ValueSet URLs (no change)
GET /ValueSet/$expand?url=${valueSetUrls.join(',')}&filter=${search}

// List operations - NOW use ValueSet URLs with url= parameter
GET /ValueSet?url=${valueSetUrl}

// Hierarchy root operations - NOW use ValueSet URLs with url= parameter
GET /ValueSet?only-roots=true&url=${valueSetUrl}

// Code expansion operations - NOW use ValueSet URLs 
POST /ValueSet/$expand
{
  "resourceType": "ValueSet", 
  "url": valueSetUrl,  // NOW uses ValueSet URL instead of CodeSystem URL
  "compose": {
    "include": [
      {
        "filter": [...]
      }
    ]
  }
}
```

## Migration Strategy

### Backward Compatibility
1. Keep existing `url` field in `ValueSetConfig` for valueset operations
2. Add new `codeSystemUrl` field for codesystem operations
3. Update service functions to accept both parameters where needed
4. Provide fallback logic during transition period

### Configuration Migration

#### Step 1: Create Unified Configuration
Merge data from both config files:

```typescript
// Merge config.dev2.json (ValueSet URLs) + config.newcodesystem.json (CodeSystem URLs)
const mergedConfig = {
  "medication": {
    "medicationAtc": {
      "url": "ATC",                                           // from dev2
      "codeSystemUrls": ["https://terminology.eds.aphp.fr/atc"]  // from newcodesystem
    },
    "medicationUcd": {
      "url": "SMT - Medicament - UCD",                       // from dev2  
      "codeSystemUrls": ["https://terminology.eds.aphp.fr/smt-medicament-ucd"]  // from newcodesystem
    }
  },
  "condition": {
    "conditionHierarchy": {
      "url": "ATIH - CIM10",                                 // from dev2
      "codeSystemUrls": ["https://smt.esante.gouv.fr/terminologie-cim-10/"]  // from newcodesystem
    }
  },
  "observation": {
    "biologyHierarchyAnabio": {
      "url": "APHP - ITM - ANABIO",                          // from dev2
      "codeSystemUrls": ["https://terminology.eds.aphp.fr/aphp-itm-anabio"]  // from newcodesystem
    },
    "biologyHierarchyLoinc": {
      "url": "APHP - ITM - LOINC",                           // from dev2
      "codeSystemUrls": ["https://terminology.eds.aphp.fr/aphp-itm-loinc"]  // from newcodesystem
    }
  }
  // ... continue for all valuesets
}
```

#### Step 2: Configuration Mapping Process
1. **Extract ValueSet URLs**: Use values from `public/config.dev2.json`
2. **Extract CodeSystem URLs**: Use values from `public/config.newcodesystem.json`  
3. **Map by Key**: Match configurations by the same key path (e.g., `features.medication.valueSets.medicationAtc`)
4. **Create Array**: Store CodeSystem URLs as array to support multiple codesystems per valueset

### Data Flow Changes
```
Before:
Config URL → Service Functions → API (same URL used everywhere)

After:
Config ValueSet URL → Search/List/Hierarchy Operations → API
Config CodeSystem URLs → Code Expansion Operations (via FhirItem.system)
FhirItem.system → CodeSystem URL (extracted from response)
Fallback: First CodeSystem URL from config (when system unavailable)
Reverse Lookup: CodeSystem URL → ValueSet URL (when needed)
```

## Testing Plan

### Unit Tests
1. Test updated service functions with both URL types
2. Test reverse lookup functionality
3. Test configuration parsing with new structure
4. Test utility function updates

### Integration Tests  
1. Test complete valueset search workflows
2. Test code expansion workflows
3. Test form integration with new URL structure
4. Test patient timeline code display

### Manual Testing
1. Verify all medical terminologies work correctly
2. Test hierarchy navigation
3. Test search functionality
4. Test code selection in forms
5. Test data export with codes

### Performance Testing
1. Ensure reverse lookup operations are performant
2. Test cache efficiency with dual URL structure
3. Monitor API call patterns for optimization opportunities

## Risk Assessment

### High Risk
- Breaking existing functionality during transition
- Incorrect URL mappings for medical terminologies
- Performance impact from additional lookups

### Medium Risk
- Complex component integration updates
- State management complexity increase
- Cache invalidation issues

### Low Risk
- Type definition updates
- Utility function updates
- Documentation updates

## Rollback Plan

### If Implementation Fails
1. Revert type definitions to original structure
2. Restore service function signatures
3. Remove new configuration fields
4. Restore original API call patterns

### Monitoring
- Monitor API error rates during deployment
- Watch for type errors in production
- Track performance metrics for lookup operations
- Monitor user-reported issues with valueset functionality

## Success Criteria

### Technical Success
- [ ] All service functions use appropriate URL types
- [ ] Reverse lookup functionality works correctly
- [ ] All medical terminologies function properly
- [ ] Type checking passes without errors
- [ ] All tests pass

### User Experience Success
- [ ] Valueset search continues to work seamlessly
- [ ] Code selection in forms works correctly  
- [ ] Patient timeline displays codes properly
- [ ] Data export includes correct code information
- [ ] No regression in performance

## Implementation Summary

### Key Changes Required ✅ COMPLETED

#### 1. Type Definitions ✅ COMPLETED
- ✅ Updated `ValueSetConfig` to include `codeSystemUrls?: string[]` (optional for transition)
- ✅ Updated `Reference` to include `codeSystemUrls?: string[]` (optional for transition)
- ✅ **CRITICAL**: Updated `FhirItem` to include `valueSetUrl?: string` field
- ✅ Updated `Hierarchy<T>` type to include `valueSetUrl?: string` field
- ✅ Added utility types for reverse lookup

#### 2. Service Layer ✅ COMPLETED
- ✅ **getChildrenFromCodes()**: Parameter unchanged, but added debug logging
- ✅ **searchInValueSets()**: Renamed `codeSystems` parameter to `valueSetUrls` for clarity
- ✅ **getCodeList()**: Changed API from `reference=` to `url=` parameter
- ✅ **getHierarchyRoots()**: Changed API from `reference=` to `url=` parameter
- ✅ **formatValuesetExpansion()**: Now populates `valueSetUrl` field in FhirItems
- ✅ **mapFhirHierarchyToHierarchyWithLabelAndSystem()**: Now preserves `valueSetUrl` field
- ✅ Added reverse lookup utility functions

#### 3. Configuration 📋 ✅ COMPLETED
- ✅ Created merged configuration approach using dotenv file
- ✅ Updated `getReferences()` to populate `codeSystemUrls` field
- ✅ Mapped ValueSet URLs (display names) to CodeSystem URLs (technical URLs)
- ✅ Support for multiple CodeSystem URLs per ValueSet

#### 4. Integration Points 🔄 ✅ COMPLETED
- ✅ **CRITICAL**: Updated `useHierarchy.ts` to use ValueSet-based organization
- ✅ Updated hierarchy management to use `groupByValueSet()` instead of `groupBySystem()`
- ✅ All hierarchy operations now use ValueSet URLs for organization
- ✅ Added reverse lookup functionality for missing `valueSetUrl` fields
- ✅ **BREAKING**: Successfully changed from CodeSystem-based to ValueSet-based grouping

#### 5. Additional Fixes ✅ COMPLETED
- ✅ **fetchCriteriasCodes()**: Added reverse lookup for CodeSystem → ValueSet URL conversion
- ✅ **chipDisplayMapper.tsx**: Updated to use ValueSet URLs for cache lookups
- ✅ **getValueSetsFromSystems()**: Renamed to `getValueSetsByUrls()` for accuracy
- ✅ Updated all callers of renamed functions throughout the codebase
- ✅ Fixed chip display functionality to work with ValueSet-based cache organization

## Actual Implementation Issues Found and Resolved

### Issue 1: Missing `valueSetUrl` in Node Objects ✅ RESOLVED
**Problem**: During hierarchy expansion, nodes were missing `valueSetUrl` field, causing fallback to CodeSystem URLs.

**Root Cause**: Service functions were not properly populating the `valueSetUrl` field in returned hierarchy items.

**Solution**: 
- Updated `formatValuesetExpansion()` to populate `valueSetUrl` from function parameter
- Updated `mapFhirHierarchyToHierarchyWithLabelAndSystem()` to preserve `valueSetUrl` field
- Updated `getHierarchyRoots()` to populate `valueSetUrl` in all returned items

**Files Modified**:
- `src/services/aphp/serviceValueSets.ts`

### Issue 2: Incorrect Method Naming ✅ RESOLVED
**Problem**: `getValueSetsFromSystems()` method name was misleading as it actually retrieved ValueSets by ValueSet URLs, not by "systems" (CodeSystem URLs).

**Root Cause**: Legacy naming that didn't reflect the actual functionality.

**Solution**: 
- Renamed `getValueSetsFromSystems()` to `getValueSetsByUrls()`
- Updated all 8+ callers throughout the codebase

**Files Modified**:
- `src/utils/valueSets.ts`
- `src/components/ExplorationBoard/config/medication.ts`
- `src/components/ExplorationBoard/config/pmsi.ts`
- `src/components/ExplorationBoard/config/biology.ts`
- `src/components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/MedicationForm.ts`
- `src/components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/Cim10Form.ts`
- `src/components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/BiologyForm.ts`
- `src/components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/CCAMForm.ts`
- `src/components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/GHMForm.tsx`

### Issue 3: Incorrect Cache Lookup in Cohort Creation ✅ RESOLVED
**Problem**: `fetchCriteriasCodes()` was using CodeSystem URLs to call `getChildrenFromCodes()`, but the function expects ValueSet URLs.

**Root Cause**: `code.system` field contains CodeSystem URL but was being passed directly as ValueSet URL.

**Solution**: 
- Added reverse lookup using `getValueSetFromCodeSystem()`
- Added fallback to `defaultValueSet` if reverse lookup fails
- Added debug logging to track conversions

**Files Modified**:
- `src/utils/cohortCreation.ts`

### Issue 4: Incorrect Cache Organization in Chip Display ✅ RESOLVED
**Problem**: Chip display was failing to show labels because it was looking up codes using CodeSystem URLs in a cache organized by ValueSet URLs.

**Root Cause**: After implementing ValueSet-based organization, the cache keys changed but the lookup logic wasn't updated.

**Solution**: 
- Updated `getLabelsForCodeSearchItem()` to use reverse lookup for converting CodeSystem URLs to ValueSet URLs
- Updated `displaySystem()` to handle both CodeSystem and ValueSet URLs
- Added fallback logic for failed reverse lookups

**Files Modified**:
- `src/components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/CriteriaForm/mappers/chipDisplayMapper.tsx`

### Issue 5: Utility Functions Using Wrong URL Types ✅ RESOLVED
**Problem**: Several utility functions in `src/utils/valueSets.ts` were being called with CodeSystem URLs but expecting ValueSet URLs for cache lookups.

**Root Cause**: Functions like `isDisplayedWithCode()`, `isDisplayedWithSystem()`, `getLabelFromSystem()` were still using direct cache lookups instead of reverse lookup.

**Solution**: 
- Implemented reverse lookup functions: `getValueSetFromCodeSystem()` and `getValueSetReferenceFromCodeSystem()`
- Updated all utility functions to use reverse lookup when receiving CodeSystem URLs
- Added fallback logic for backward compatibility

**Files Modified**:
- `src/utils/valueSets.ts`
- `src/services/aphp/serviceValueSets.ts`

## Debug Logging Added

Comprehensive debug logging was added to trace the complete flow:

### Service Level Logging
- `getChildrenFromCodes()`: Logs input parameters
- `formatValuesetExpansion()`: Logs FhirItem creation and ValueSet URL population
- `getHierarchyRoots()`: Logs input parameters and returned items
- `mapFhirHierarchyToHierarchyWithLabelAndSystem()`: Logs ValueSet URL preservation

### Hook Level Logging  
- `useHierarchy.expand()`: Logs node properties and hierarchyId resolution
- `initTrees()`: Logs handler processing and base tree items

### Utility Level Logging
- `getMissingCodes()`: Logs fetchHandler calls with parameters
- `checkIsLeaf()`: Logs URL resolution logic

### Application Level Logging
- `fetchCriteriasCodes()`: Logs CodeSystem → ValueSet URL conversions
- `getLabelsForCodeSearchItem()`: Logs cache lookup conversions

## Verification Status

All critical components have been updated and tested:

✅ **Type System**: All TypeScript compilation errors resolved  
✅ **Service Layer**: All API calls use correct URL types  
✅ **Hierarchy Management**: Converted from CodeSystem-based to ValueSet-based organization  
✅ **Configuration**: Reference objects properly populated with both URL types  
✅ **Cache Organization**: ValueSet store now organized by ValueSet URLs  
✅ **Reverse Lookup**: Functional conversion from CodeSystem URLs to ValueSet URLs  
✅ **Chip Display**: Code labels display correctly using proper cache lookups  
✅ **Linting**: All ESLint errors resolved

### Critical Implementation Notes

1. **Most search/list functions already work correctly** - they use ValueSet URLs despite misleading parameter names
2. **Breaking changes needed**:
   - `getChildrenFromCodes()`: Switch from CodeSystem URL to ValueSet URL in API calls
   - `getCodeList()`: Change API from `reference=${url}` to `url=${valueSetUrl}` 
   - `getHierarchyRoots()`: Change API from `reference=${url}` to `url=${valueSetUrl}`
3. **All operations now use ValueSet URLs** - server handles mapping to constituent CodeSystems
4. **CodeSystem detection** should prioritize FhirItem.system from server response over config fallback
5. **Configuration merger** can be automated by matching keys between config files

### Risk Assessment

- **Low Risk**: Type updates, configuration generation, parameter renaming
- **Medium Risk**: getChildrenFromCodes() breaking change and all its callers  
- **High Risk**: Incorrect URL mappings between dev2 and newcodesystem configs

## Timeline

### Phase 1: Preparation (Day 1)
- Update type definitions
- Create configuration merger utility
- Generate merged config from existing files

### Phase 2: Service Layer (Day 1)  
- Update getChildrenFromCodes() signature and implementation
- Add CodeSystem detection logic
- Update parameter names for clarity

### Phase 3: Integration (Day 2)
- Update all callers of getChildrenFromCodes()
- Update utility functions for new config structure
- Add reverse lookup functionality

### Phase 4: Testing & Validation (Day 2)
- Comprehensive testing of all ValueSet operations
- Validate URL mappings work correctly
- Performance testing

## Critical Hierarchy Management Issues

### Problem: useHierarchy.ts Uses CodeSystem-Based Organization

#### Current Issues in `src/hooks/hierarchy/useHierarchy.ts`:

1. **Line 30: fetchHandler Signature**
   ```typescript
   // Current - expects CodeSystem URL
   fetchHandler: (ids: string, system: string) => Promise<Hierarchy<T>[]>
   
   // Should be - expects ValueSet URL
   fetchHandler: (ids: string, valueSetUrl: string) => Promise<Hierarchy<T>[]>
   ```

2. **Lines 36, 88, 121, 140: groupBySystem() Usage**
   ```typescript
   // Current - groups by CodeSystem URL
   groupBySystem(selectedNodes)
   
   // Should be - groups by ValueSet URL  
   groupByValueSet(selectedNodes)
   ```

3. **Map Storage Keys**
   ```typescript
   // Current - uses CodeSystem URLs as keys
   Map<string, Hierarchy<T>[]>  // keyed by system (CodeSystem URL)
   
   // Should be - uses ValueSet URLs as keys
   Map<string, Hierarchy<T>[]>  // keyed by valueSetUrl
   ```

4. **Missing ValueSet URL in Code Objects**
   - `FhirItem` objects need `valueSetUrl` field populated
   - Service functions must set this field when returning codes
   - Fallback logic needed when ValueSet URL not available

### Required Changes:

#### 1. Update FhirItem Population
```typescript
// Service functions must populate both fields:
const fhirItem: FhirItem = {
  id: code.code,
  system: code.system,           // CodeSystem URL from server
  valueSetUrl: valueSetUrl,      // ValueSet URL from function parameter  
  label: code.display,
  // ... other fields
}
```

#### 2. Create groupByValueSet() Utility
```typescript
// New utility function needed
export const groupByValueSet = <T>(items: Hierarchy<T>[]): Array<{valueSetUrl: string, codes: Hierarchy<T>[]}> => {
  // Group items by valueSetUrl instead of system
}
```

#### 3. Update useHierarchy.ts Organization
```typescript
// Change all Map keys from system to valueSetUrl
const [trees, setTrees] = useState<Map<string, Hierarchy<T>[]>>(new Map())  // now keyed by valueSetUrl
const [selectedCodes, setSelectedCodes] = useState<Codes<Hierarchy<T>>>(
  new Map(groupByValueSet(selectedNodes).map((item) => [item.valueSetUrl, mapHierarchyToMap(item.codes)]))
)
```

#### 4. Reverse Lookup Functionality
```typescript
// When FhirItem.valueSetUrl is missing, use reverse lookup
export const getValueSetUrlFromCodeSystem = (codeSystemUrl: string, config: AppConfig): string | undefined => {
  // Search through config to find ValueSet that contains this CodeSystem
}
```

### Impact Assessment:

- **HIGH IMPACT**: useHierarchy.ts is core to all hierarchy navigation
- **BREAKING CHANGE**: All hierarchy-based components affected
- **MIGRATION NEEDED**: Existing stored hierarchy data may need conversion
- **TESTING CRITICAL**: All ValueSet selection and navigation must be retested

### Implementation Order:

1. Update FhirItem type and service function population
2. Create groupByValueSet() and reverse lookup utilities  
3. Update useHierarchy.ts to use ValueSet-based organization
4. Update all components that use useHierarchy
5. Comprehensive testing of hierarchy functionality