import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { Column, Mapping, ConverterConfig, Profile } from '../types';
import { defaultConverterConfig, STORAGE_KEYS } from '../types';

interface MappingContextType {
  // State
  sourceColumns: Column[];
  targetColumns: Column[];
  mappings: Mapping[];
  sourceData: Record<string, string>[];

  // Profile state
  profiles: Profile[];
  currentProfileId: string | null;

  // Source columns actions
  setSourceColumns: (columns: Column[]) => void;

  // Target columns actions
  addTargetColumn: (name: string) => void;
  updateTargetColumn: (id: string, name: string) => void;
  removeTargetColumn: (id: string) => void;
  setTargetColumns: (columns: Column[]) => void;
  reorderTargetColumns: (oldIndex: number, newIndex: number) => void;

  // Source data actions
  setSourceData: (data: Record<string, string>[]) => void;

  // Mapping actions
  setMappings: (mappings: Mapping[]) => void;
  addMapping: () => void;
  updateMapping: (id: string, updates: Partial<Mapping>) => void;
  removeMapping: (id: string) => void;
  reorderMappings: (oldIndex: number, newIndex: number) => void;
  autoMapMatchingColumns: () => number;

  // Converter actions
  addConverter: (mappingId: string) => void;
  updateConverter: (mappingId: string, index: number, config: ConverterConfig) => void;
  removeConverter: (mappingId: string, index: number) => void;
  reorderConverters: (mappingId: string, oldIndex: number, newIndex: number) => void;

  // Profile actions
  saveProfile: (name: string) => void;
  loadProfile: (profileId: string) => void;
  deleteProfile: (profileId: string) => void;
  renameProfile: (profileId: string, name: string) => void;
  updateCurrentProfile: () => void;
  importProfile: (profile: Profile, overwrite?: boolean) => void;
  getProfileByName: (name: string) => Profile | undefined;

  // Reset
  resetAll: () => void;
}

const MappingContext = createContext<MappingContextType | null>(null);

export function MappingProvider({ children }: { children: React.ReactNode }) {
  const [sourceColumns, setSourceColumns] = useLocalStorage<Column[]>(
    STORAGE_KEYS.SOURCE_COLUMNS,
    []
  );
  const [targetColumns, setTargetColumns] = useLocalStorage<Column[]>(
    STORAGE_KEYS.TARGET_COLUMNS,
    []
  );
  const [mappings, setMappings] = useLocalStorage<Mapping[]>(
    STORAGE_KEYS.MAPPINGS,
    []
  );
  const [profiles, setProfiles] = useLocalStorage<Profile[]>(
    STORAGE_KEYS.PROFILES,
    []
  );
  const [currentProfileId, setCurrentProfileId] = useLocalStorage<string | null>(
    STORAGE_KEYS.CURRENT_PROFILE_ID,
    null
  );
  const [sourceData, setSourceData] = React.useState<Record<string, string>[]>([]);

  // Target columns actions
  const addTargetColumn = useCallback((name: string) => {
    const newColumn: Column = {
      id: `target_${Date.now()}`,
      name,
    };
    setTargetColumns((prev) => [...prev, newColumn]);
  }, [setTargetColumns]);

  const updateTargetColumn = useCallback((id: string, name: string) => {
    setTargetColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, name } : col))
    );
  }, [setTargetColumns]);

  const removeTargetColumn = useCallback((id: string) => {
    setTargetColumns((prev) => prev.filter((col) => col.id !== id));
    setMappings((prev) => prev.filter((m) => m.targetColumnId !== id));
  }, [setTargetColumns, setMappings]);

  const reorderTargetColumns = useCallback((oldIndex: number, newIndex: number) => {
    setTargetColumns((prev) => {
      const newColumns = [...prev];
      const [removed] = newColumns.splice(oldIndex, 1);
      newColumns.splice(newIndex, 0, removed);
      return newColumns;
    });
  }, [setTargetColumns]);

  // Mapping actions
  const addMapping = useCallback(() => {
    const newMapping: Mapping = {
      id: `mapping_${Date.now()}`,
      sourceColumnId: sourceColumns[0]?.id || '',
      targetColumnId: targetColumns[0]?.id || '',
      converters: [{ ...defaultConverterConfig }],
    };
    setMappings((prev) => [...prev, newMapping]);
  }, [sourceColumns, targetColumns, setMappings]);

  const updateMapping = useCallback((id: string, updates: Partial<Mapping>) => {
    setMappings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, [setMappings]);

  const removeMapping = useCallback((id: string) => {
    setMappings((prev) => prev.filter((m) => m.id !== id));
  }, [setMappings]);

  const reorderMappings = useCallback((oldIndex: number, newIndex: number) => {
    setMappings((prev) => {
      const newMappings = [...prev];
      const [removed] = newMappings.splice(oldIndex, 1);
      newMappings.splice(newIndex, 0, removed);
      return newMappings;
    });
  }, [setMappings]);

  const autoMapMatchingColumns = useCallback(() => {
    // 既存のマッピングで使用されているtargetColumnIdを取得
    const usedTargetIds = new Set(mappings.map((m) => m.targetColumnId));

    // 同名カラムを探してマッピングを作成
    const newMappings: Mapping[] = [];
    for (const targetCol of targetColumns) {
      // 既にマッピングされている場合はスキップ
      if (usedTargetIds.has(targetCol.id)) continue;

      // 同名のソースカラムを探す
      const matchingSource = sourceColumns.find(
        (sourceCol) => sourceCol.name === targetCol.name
      );

      if (matchingSource) {
        newMappings.push({
          id: `mapping_${Date.now()}_${newMappings.length}`,
          sourceColumnId: matchingSource.id,
          targetColumnId: targetCol.id,
          converters: [{ ...defaultConverterConfig }],
        });
      }
    }

    if (newMappings.length > 0) {
      setMappings((prev) => [...prev, ...newMappings]);
    }

    return newMappings.length;
  }, [sourceColumns, targetColumns, mappings, setMappings]);

  // Converter actions
  const addConverter = useCallback((mappingId: string) => {
    setMappings((prev) =>
      prev.map((m) =>
        m.id === mappingId
          ? { ...m, converters: [...m.converters, { ...defaultConverterConfig }] }
          : m
      )
    );
  }, [setMappings]);

  const updateConverter = useCallback(
    (mappingId: string, index: number, config: ConverterConfig) => {
      setMappings((prev) =>
        prev.map((m) => {
          if (m.id !== mappingId) return m;
          const newConverters = [...m.converters];
          newConverters[index] = config;
          return { ...m, converters: newConverters };
        })
      );
    },
    [setMappings]
  );

  const removeConverter = useCallback((mappingId: string, index: number) => {
    setMappings((prev) =>
      prev.map((m) => {
        if (m.id !== mappingId) return m;
        if (m.converters.length <= 1) return m;
        const newConverters = m.converters.filter((_, i) => i !== index);
        return { ...m, converters: newConverters };
      })
    );
  }, [setMappings]);

  const reorderConverters = useCallback(
    (mappingId: string, oldIndex: number, newIndex: number) => {
      setMappings((prev) =>
        prev.map((m) => {
          if (m.id !== mappingId) return m;
          const newConverters = [...m.converters];
          const [removed] = newConverters.splice(oldIndex, 1);
          newConverters.splice(newIndex, 0, removed);
          return { ...m, converters: newConverters };
        })
      );
    },
    [setMappings]
  );

  // Profile actions
  const saveProfile = useCallback((name: string) => {
    const now = Date.now();
    const newProfile: Profile = {
      id: `profile_${now}`,
      name,
      sourceColumns,
      targetColumns,
      mappings,
      createdAt: now,
      updatedAt: now,
    };
    setProfiles((prev) => [...prev, newProfile]);
    setCurrentProfileId(newProfile.id);
  }, [sourceColumns, targetColumns, mappings, setProfiles, setCurrentProfileId]);

  const loadProfile = useCallback((profileId: string) => {
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;

    setSourceColumns(profile.sourceColumns);
    setTargetColumns(profile.targetColumns);
    setMappings(profile.mappings);
    setCurrentProfileId(profileId);
    setSourceData([]); // CSVデータはリセット
  }, [profiles, setSourceColumns, setTargetColumns, setMappings, setCurrentProfileId]);

  const deleteProfile = useCallback((profileId: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    if (currentProfileId === profileId) {
      setCurrentProfileId(null);
    }
  }, [currentProfileId, setProfiles, setCurrentProfileId]);

  const renameProfile = useCallback((profileId: string, name: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === profileId ? { ...p, name, updatedAt: Date.now() } : p
      )
    );
  }, [setProfiles]);

  const updateCurrentProfile = useCallback(() => {
    if (!currentProfileId) return;

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === currentProfileId
          ? {
              ...p,
              sourceColumns,
              targetColumns,
              mappings,
              updatedAt: Date.now(),
            }
          : p
      )
    );
  }, [currentProfileId, sourceColumns, targetColumns, mappings, setProfiles]);

  const getProfileByName = useCallback(
    (name: string) => {
      return profiles.find((p) => p.name === name);
    },
    [profiles]
  );

  const importProfile = useCallback(
    (profile: Profile, overwrite = false) => {
      const newProfileId = `profile_${Date.now()}`;

      setProfiles((prev) => {
        try {
          // 上書きの場合は既存を削除
          const filtered = overwrite
            ? prev.filter((p) => p.name !== profile.name)
            : prev;

          // 新規追加
          const newProfile: Profile = {
            ...profile,
            id: newProfileId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          return [...filtered, newProfile];
        } catch {
          // 失敗時は元のリストを復元
          return prev;
        }
      });

      // インポート後、自動的にプロファイルを読み込む
      setSourceColumns(profile.sourceColumns);
      setTargetColumns(profile.targetColumns);
      setMappings(profile.mappings);
      setCurrentProfileId(newProfileId);
      setSourceData([]);
    },
    [setProfiles, setSourceColumns, setTargetColumns, setMappings, setCurrentProfileId]
  );

  // Reset all
  const resetAll = useCallback(() => {
    setSourceColumns([]);
    setTargetColumns([]);
    setMappings([]);
    setSourceData([]);
    setCurrentProfileId(null);
  }, [setSourceColumns, setTargetColumns, setMappings, setCurrentProfileId]);

  const value = useMemo(
    () => ({
      sourceColumns,
      targetColumns,
      mappings,
      sourceData,
      profiles,
      currentProfileId,
      setSourceColumns,
      addTargetColumn,
      updateTargetColumn,
      removeTargetColumn,
      setTargetColumns,
      reorderTargetColumns,
      setSourceData,
      setMappings,
      addMapping,
      updateMapping,
      removeMapping,
      reorderMappings,
      autoMapMatchingColumns,
      addConverter,
      updateConverter,
      removeConverter,
      reorderConverters,
      saveProfile,
      loadProfile,
      deleteProfile,
      renameProfile,
      updateCurrentProfile,
      importProfile,
      getProfileByName,
      resetAll,
    }),
    [
      sourceColumns,
      targetColumns,
      mappings,
      sourceData,
      profiles,
      currentProfileId,
      setSourceColumns,
      addTargetColumn,
      updateTargetColumn,
      removeTargetColumn,
      setTargetColumns,
      reorderTargetColumns,
      setMappings,
      addMapping,
      updateMapping,
      removeMapping,
      reorderMappings,
      autoMapMatchingColumns,
      addConverter,
      updateConverter,
      removeConverter,
      reorderConverters,
      saveProfile,
      loadProfile,
      deleteProfile,
      renameProfile,
      updateCurrentProfile,
      importProfile,
      getProfileByName,
      resetAll,
    ]
  );

  return (
    <MappingContext.Provider value={value}>{children}</MappingContext.Provider>
  );
}

export function useMappingContext() {
  const context = useContext(MappingContext);
  if (!context) {
    throw new Error('useMappingContext must be used within a MappingProvider');
  }
  return context;
}
