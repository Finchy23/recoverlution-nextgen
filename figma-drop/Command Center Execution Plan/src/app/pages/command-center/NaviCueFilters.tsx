import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCommandCenterStore } from '@/app/stores/commandCenterStore';
import { fetchNaviCueFacets } from '@/app/utils/fetchSupabaseData';
import { colors, surfaces, fonts, radius } from '@/design-tokens';
import { Filter, X } from 'lucide-react';

/**
 * NAVICUE FILTERS
 * 
 * Apple-grade filter interface for NaviCue catalog
 * - Uses RPC facets from Supabase
 * - NaviCue Type dropdown shows all 1,435 IDs for selection
 * - Clean, minimal design
 */

export function NaviCueFilters() {
  const {
    allNavicueTypes,
    navicueFilters,
    setNavicueFilter,
    clearNavicueFilters,
    applyNavicueFilters,
  } = useCommandCenterStore();

  const [isOpen, setIsOpen] = useState(false);
  const [facets, setFacets] = useState<any>(null);

  // Load facets from RPC on mount
  useEffect(() => {
    const loadFacets = async () => {
      try {
        console.log('🎨 Loading filter facets from RPC...');
        const data = await fetchNaviCueFacets();
        console.log('✅ Facets loaded:', data);
        setFacets(data);
      } catch (error) {
        console.error('❌ Error loading facets:', error);
      }
    };
    loadFacets();
  }, []);

  // Get all unique NaviCue Type IDs from the loaded matrix
  const getAllNaviCueTypeIds = () => {
    return allNavicueTypes
      .map((nc: any) => nc.navicue_type_id)
      .filter((id: string) => id && id.trim() !== '')
      .sort();
  };

  const filterOptions = [
    { 
      key: 'navicue_type_id', 
      label: 'NaviCue Type', 
      values: getAllNaviCueTypeIds(),
      searchable: true,
    },
    { 
      key: 'intent', 
      label: 'Intent', 
      values: facets?.intents || [],
      searchable: false,
    },
    { 
      key: 'mechanism', 
      label: 'Mechanism', 
      values: facets?.mechanisms || [],
      searchable: false,
    },
    { 
      key: 'kbe_layer', 
      label: 'KBE Layer', 
      values: facets?.kbe_layers || [],
      searchable: false,
    },
    { 
      key: 'magic_signature', 
      label: 'Magic Signature', 
      values: facets?.magic_signatures || [],
      searchable: false,
    },
    { 
      key: 'form', 
      label: 'Form Archetype', 
      values: facets?.form_archetypes || [],
      searchable: false,
    },
  ];

  // Apply filters whenever they change (but only if data is loaded)
  useEffect(() => {
    if (allNavicueTypes.length > 0) {
      applyNavicueFilters();
    }
  }, [navicueFilters, allNavicueTypes.length]);

  const activeFilterCount = Object.values(navicueFilters).filter(v => v !== null).length;

  const handleClearFilters = () => {
    clearNavicueFilters();
    applyNavicueFilters();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: 0,
        right: 0,
        zIndex: 40,
        backgroundColor: 'rgba(11, 11, 12, 0.6)',
        backdropFilter: 'blur(40px) saturate(200%)',
        borderBottom: `1px solid ${colors.neutral.gray[100]}`,
      }}
    >
      <div
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '12px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Filter Toggle Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            background: isOpen ? colors.neutral.gray[100] : surfaces.glass.medium,
            border: `1px solid ${colors.neutral.gray[100]}`,
            borderRadius: radius.sm,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontFamily: fonts.primary,
            fontSize: '13px',
            fontWeight: '500',
            color: colors.neutral.white,
            transition: 'all 0.2s ease',
          }}
        >
          <Filter size={16} />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <div
              style={{
                backgroundColor: colors.accent.cyan.primary,
                color: colors.neutral.black,
                fontSize: '11px',
                fontWeight: '600',
                padding: '2px 6px',
                borderRadius: radius.xs,
                marginLeft: '4px',
              }}
            >
              {activeFilterCount}
            </div>
          )}
        </motion.button>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleClearFilters}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: 'transparent',
              border: `1px solid ${colors.neutral.gray[100]}`,
              borderRadius: radius.sm,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontFamily: fonts.primary,
              fontSize: '12px',
              color: colors.neutral.gray[400],
              transition: 'all 0.2s ease',
            }}
          >
            <X size={14} />
            <span>Clear</span>
          </motion.button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Result Count */}
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: '12px',
            color: colors.neutral.gray[400],
          }}
        >
          Showing {useCommandCenterStore.getState().navicueTypes.length} of {allNavicueTypes.length}
        </div>
      </div>

      {/* Filter Dropdowns */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              overflow: 'visible',
              borderTop: `1px solid ${colors.neutral.gray[100]}`,
            }}
          >
            <div
              style={{
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '20px 32px 24px 32px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              {filterOptions.map((option) => (
                <FilterDropdown
                  key={option.key}
                  label={option.label}
                  value={(navicueFilters as any)[option.key]}
                  options={option.values}
                  onChange={(value) => setNavicueFilter(option.key as any, value)}
                  searchable={option.searchable}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Filter Dropdown Component
interface FilterDropdownProps {
  label: string;
  value: string | null;
  options: string[];
  onChange: (value: string | null) => void;
  searchable?: boolean;
}

function FilterDropdown({ label, value, options, onChange, searchable = false }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  // Truncate long values for display
  const formatValue = (val: string) => {
    if (val.length > 50) {
      return val.substring(0, 50) + '...';
    }
    return val;
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Label */}
      <label
        style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '500',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: colors.neutral.gray[400],
          marginBottom: '6px',
        }}
      >
        {label}
      </label>

      {/* Dropdown Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        style={{
          width: '100%',
          background: surfaces.glass.medium,
          border: `1px solid ${value ? colors.accent.cyan.primary : colors.neutral.gray[100]}`,
          borderRadius: radius.sm,
          padding: '10px 12px',
          textAlign: 'left',
          cursor: 'pointer',
          fontFamily: fonts.primary,
          fontSize: '13px',
          color: value ? colors.neutral.white : colors.neutral.gray[500],
          transition: 'all 0.2s ease',
          position: 'relative',
        }}
      >
        <div style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis', 
          whiteSpace: 'nowrap' 
        }}>
          {value ? formatValue(value) : `All ${label}`}
        </div>

        {/* Arrow indicator */}
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
            transition: 'transform 0.2s ease',
            color: colors.neutral.gray[400],
            fontSize: '10px',
          }}
        >
          ▼
        </div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop to close dropdown */}
            <div
              onClick={() => setIsOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10,
              }}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                maxHeight: '300px',
                overflowY: 'auto',
                backgroundColor: surfaces.solid.elevated,
                border: `1px solid ${colors.neutral.gray[100]}`,
                borderRadius: radius.sm,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                zIndex: 20,
              }}
            >
              {/* Clear option */}
              <button
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  background: value === null ? colors.neutral.gray[100] : 'transparent',
                  border: 'none',
                  padding: '10px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: fonts.primary,
                  fontSize: '13px',
                  color: colors.neutral.gray[400],
                  borderBottom: `1px solid ${colors.neutral.gray[100]}`,
                  transition: 'background 0.1s ease',
                }}
                onMouseEnter={(e) => {
                  if (value !== null) e.currentTarget.style.background = colors.neutral.gray[100];
                }}
                onMouseLeave={(e) => {
                  if (value !== null) e.currentTarget.style.background = 'transparent';
                }}
              >
                All {label}
              </button>

              {/* Search Input */}
              {searchable && (
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: fonts.primary,
                    fontSize: '13px',
                    color: colors.neutral.gray[400],
                    borderBottom: `1px solid ${colors.neutral.gray[100]}`,
                    transition: 'background 0.1s ease',
                    outline: 'none',
                  }}
                />
              )}

              {/* Options */}
              {filteredOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                  }}
                  style={{
                    width: '100%',
                    background: value === option ? colors.neutral.gray[100] : 'transparent',
                    border: 'none',
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontFamily: fonts.primary,
                    fontSize: '13px',
                    color: colors.neutral.white,
                    transition: 'background 0.1s ease',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== option) e.currentTarget.style.background = colors.neutral.gray[100];
                  }}
                  onMouseLeave={(e) => {
                    if (value !== option) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {formatValue(option)}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}