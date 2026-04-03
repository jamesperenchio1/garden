'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { Plant, Photo, LogEntry, HealthTag } from '@/types/plant';

export function usePlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const allPlants = await db.plants.orderBy('createdAt').reverse().toArray();
    setPlants(allPlants);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPlant = useCallback(async (plant: Omit<Plant, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const id = await db.plants.add({
      ...plant,
      createdAt: now,
      updatedAt: now,
    } as Plant);
    await refresh();
    return id;
  }, [refresh]);

  const updatePlant = useCallback(async (id: number, updates: Partial<Plant>) => {
    await db.plants.update(id, { ...updates, updatedAt: new Date() });
    await refresh();
  }, [refresh]);

  const deletePlant = useCallback(async (id: number) => {
    await db.transaction('rw', [db.plants, db.photos, db.logEntries, db.tasks], async () => {
      await db.photos.where('plantId').equals(id).delete();
      await db.logEntries.where('plantId').equals(id).delete();
      await db.tasks.where('plantId').equals(id).delete();
      await db.plants.delete(id);
    });
    await refresh();
  }, [refresh]);

  const addHealthTag = useCallback(async (plantId: number, tag: HealthTag) => {
    const plant = await db.plants.get(plantId);
    if (plant) {
      const healthTags = [...(plant.healthTags || []), tag];
      await db.plants.update(plantId, { healthTags, updatedAt: new Date() });
      await refresh();
    }
  }, [refresh]);

  const removeHealthTag = useCallback(async (plantId: number, tagIndex: number) => {
    const plant = await db.plants.get(plantId);
    if (plant) {
      const healthTags = plant.healthTags.filter((_, i) => i !== tagIndex);
      await db.plants.update(plantId, { healthTags, updatedAt: new Date() });
      await refresh();
    }
  }, [refresh]);

  return { plants, loading, addPlant, updatePlant, deletePlant, addHealthTag, removeHealthTag, refresh };
}

export function usePlantPhotos(plantId: number | undefined) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    const plantPhotos = await db.photos
      .where('plantId')
      .equals(plantId)
      .reverse()
      .sortBy('createdAt');
    setPhotos(plantPhotos);
    setLoading(false);
  }, [plantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addPhoto = useCallback(async (photo: Omit<Photo, 'id'>) => {
    await db.photos.add(photo as Photo);
    await refresh();
  }, [refresh]);

  const deletePhoto = useCallback(async (id: number) => {
    await db.photos.delete(id);
    await refresh();
  }, [refresh]);

  return { photos, loading, addPhoto, deletePhoto, refresh };
}

export function usePlantLog(plantId: number | undefined) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    const logEntries = await db.logEntries
      .where('plantId')
      .equals(plantId)
      .reverse()
      .sortBy('createdAt');
    setEntries(logEntries);
    setLoading(false);
  }, [plantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = useCallback(async (entry: Omit<LogEntry, 'id'>) => {
    await db.logEntries.add(entry as LogEntry);
    await refresh();
  }, [refresh]);

  return { entries, loading, addEntry, refresh };
}
