import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Announcement,
  DocumentItem,
  EventItem,
  EventPhase,
  Infographic,
  PortalSettings,
  ScheduleItem,
  Subtopic,
  Topic,
  TravelAccommodationInfo,
} from '../types';
import {
  initialAnnouncements,
  initialDocuments,
  initialEvents,
  initialInfographics,
  initialSchedules,
  initialSettings,
  initialSubtopics,
  initialTopics,
  initialTravelInfo,
  defaultQuickAccessItems,
} from '../data/initialData';
import { db, isFirebaseConfigured, auth, cleanForFirestore } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';

interface AppContextType {
  settings: PortalSettings;
  topics: Topic[];
  subtopics: Subtopic[];
  announcements: Announcement[];
  events: EventItem[];
  schedules: ScheduleItem[];
  infographics: Infographic[];
  documents: DocumentItem[];
  travelInfo: TravelAccommodationInfo;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedEventFilter: string | null;
  setSelectedEventFilter: (id: string | null) => void;
  selectedTopicFilter: string | null;
  setSelectedTopicFilter: (id: string | null) => void;
  isCloudSyncActive: boolean;
  cloudSyncLastUpdated: string | null;

  // Actions
  updateSettings: (updates: Partial<PortalSettings>) => Promise<void>;
  setActivePhase: (phase: EventPhase) => Promise<void>;

  // Topic CRUD
  addTopic: (data: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  reorderTopic: (id: string, direction: 'up' | 'down') => Promise<void>;

  // Subtopic CRUD
  addSubtopic: (data: Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateSubtopic: (id: string, updates: Partial<Subtopic>) => Promise<void>;
  deleteSubtopic: (id: string) => Promise<void>;
  reorderSubtopic: (id: string, direction: 'up' | 'down') => Promise<void>;

  // Announcements CRUD
  addAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>) => Promise<string>;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  togglePinAnnouncement: (id: string) => Promise<void>;

  // Events CRUD
  addEvent: (data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEvent: (id: string, updates: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Schedules CRUD
  addSchedule: (data: Omit<ScheduleItem, 'id'>) => Promise<string>;
  updateSchedule: (id: string, updates: Partial<ScheduleItem>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  // Infographics CRUD
  addInfographic: (data: Omit<Infographic, 'id' | 'uploadedAt'>) => Promise<string>;
  updateInfographic: (id: string, updates: Partial<Infographic>) => Promise<void>;
  deleteInfographic: (id: string) => Promise<void>;
  reorderInfographic: (id: string, direction: 'left' | 'right') => Promise<void>;

  // Documents CRUD
  addDocument: (data: Omit<DocumentItem, 'id' | 'updatedAt'>) => Promise<string>;
  updateDocument: (id: string, updates: Partial<DocumentItem>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Travel Info
  updateTravelInfo: (updates: Partial<TravelAccommodationInfo>) => Promise<void>;

  // Helper
  resetToInitialData: () => void;
}

const STORAGE_KEY = 'syncrozz_kpmbp_hub_data_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try loading from localStorage first, fallback to initialData
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<string | null>(null);
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string | null>(null);

  const [settings, setSettings] = useState<PortalSettings>(initialSettings);
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [subtopics, setSubtopics] = useState<Subtopic[]>(initialSubtopics);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [infographics, setInfographics] = useState<Infographic[]>(initialInfographics);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [travelInfo, setTravelInfo] = useState<TravelAccommodationInfo>(initialTravelInfo);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState<boolean>(false);
  const [cloudSyncLastUpdated, setCloudSyncLastUpdated] = useState<string | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.topics) setTopics(parsed.topics);
        if (parsed.subtopics) setSubtopics(parsed.subtopics);
        if (parsed.announcements) setAnnouncements(parsed.announcements);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.schedules) setSchedules(parsed.schedules);
        if (parsed.infographics) setInfographics(parsed.infographics);
        if (parsed.documents) setDocuments(parsed.documents);
        if (parsed.travelInfo) setTravelInfo(parsed.travelInfo);
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    } finally {
      setDataLoaded(true);
    }
  }, []);

  // Save changes to localStorage whenever state changes
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      const payload = {
        settings,
        topics,
        subtopics,
        announcements,
        events,
        schedules,
        infographics,
        documents,
        travelInfo,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [
    dataLoaded,
    settings,
    topics,
    subtopics,
    announcements,
    events,
    schedules,
    infographics,
    documents,
    travelInfo,
  ]);

  // Connect to Firestore real-time listeners across all devices
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    let unsubSettings: (() => void) | undefined;
    let unsubTravel: (() => void) | undefined;
    let unsubTopics: (() => void) | undefined;
    let unsubSubtopics: (() => void) | undefined;
    let unsubAnn: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;
    let unsubSchedules: (() => void) | undefined;
    let unsubInfographics: (() => void) | undefined;
    let unsubDocuments: (() => void) | undefined;

    const onSyncSuccess = () => {
      setIsCloudSyncActive(true);
      setCloudSyncLastUpdated(new Date().toLocaleTimeString());
    };

    try {
      // 1. Settings listener
      unsubSettings = onSnapshot(
        doc(db, 'settings', 'general'),
        (snap) => {
          if (snap.exists()) {
            setSettings(snap.data() as PortalSettings);
            onSyncSuccess();
          }
        },
        (err) => console.warn('[Firestore] settings listener:', err.message)
      );

      // 2. Travel & Accommodation listener
      unsubTravel = onSnapshot(
        doc(db, 'settings', 'travelAccommodation'),
        (snap) => {
          if (snap.exists()) {
            setTravelInfo(snap.data() as TravelAccommodationInfo);
            onSyncSuccess();
          }
        },
        (err) => console.warn('[Firestore] travel info listener:', err.message)
      );

      // 3. Topics listener
      unsubTopics = onSnapshot(
        collection(db, 'topics'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Topic));
            setTopics(list.sort((a, b) => a.displayOrder - b.displayOrder));
            onSyncSuccess();
          }
        },
        (error) => console.warn('[Firestore] topics listener:', error.message)
      );

      // 4. Subtopics listener
      unsubSubtopics = onSnapshot(
        collection(db, 'subtopics'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Subtopic));
            setSubtopics(list.sort((a, b) => a.displayOrder - b.displayOrder));
            onSyncSuccess();
          }
        },
        (error) => console.warn('[Firestore] subtopics listener:', error.message)
      );

      // 5. Announcements listener
      unsubAnn = onSnapshot(
        collection(db, 'announcements'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
            setAnnouncements(
              list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            );
            onSyncSuccess();
          }
        },
        (error) => console.warn('[Firestore] announcements listener:', error.message)
      );

      // 6. Events listener
      unsubEvents = onSnapshot(
        collection(db, 'events'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));
            setEvents(list.sort((a, b) => a.displayOrder - b.displayOrder));
            onSyncSuccess();
          }
        },
        (error) => console.warn('[Firestore] events listener:', error.message)
      );

      // 7. Schedules listener
      unsubSchedules = onSnapshot(
        collection(db, 'schedules'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ScheduleItem));
            setSchedules(list);
            onSyncSuccess();
          }
        },
        (error) => console.warn('[Firestore] schedules listener:', error.message)
      );

      // 8. Infographics listener
      unsubInfographics = onSnapshot(
        collection(db, 'infographics'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Infographic));
            list.sort((a, b) => {
              const orderA = a.displayOrder ?? 999;
              const orderB = b.displayOrder ?? 999;
              if (orderA !== orderB) return orderA - orderB;
              const timeA = new Date(a.updatedAt || a.uploadedAt || 0).getTime();
              const timeB = new Date(b.updatedAt || b.uploadedAt || 0).getTime();
              return timeB - timeA;
            });
            setInfographics(list);
            onSyncSuccess();
          }
        },
        (error) => console.warn('[Firestore] infographics listener:', error.message)
      );

      // 9. Documents listener
      unsubDocuments = onSnapshot(
        collection(db, 'documents'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DocumentItem));
            setDocuments(list);
            onSyncSuccess();
          }
        },
        (error) => console.warn('[Firestore] documents listener:', error.message)
      );
    } catch (e) {
      console.warn('Firestore snapshot setup error:', e);
    }

    return () => {
      unsubSettings?.();
      unsubTravel?.();
      unsubTopics?.();
      unsubSubtopics?.();
      unsubAnn?.();
      unsubEvents?.();
      unsubSchedules?.();
      unsubInfographics?.();
      unsubDocuments?.();
    };
  }, []);

  // Sync item to Cloud Firestore for cross-device synchronization
  const syncToFirestore = async (collectionName: string, id: string, data: Record<string, unknown>) => {
    if (isFirebaseConfigured && db) {
      try {
        const cleaned = cleanForFirestore(data);
        await setDoc(doc(db, collectionName, id), cleaned, { merge: true });
        setIsCloudSyncActive(true);
        setCloudSyncLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn(`[Firestore] Sync error on ${collectionName}/${id}:`, err);
      }
    }
  };

  const deleteFromFirestore = async (collectionName: string, id: string) => {
    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        setIsCloudSyncActive(true);
        setCloudSyncLastUpdated(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn(`[Firestore] Delete error on ${collectionName}/${id}:`, err);
      }
    }
  };

  // Settings
  const updateSettings = async (updates: Partial<PortalSettings>) => {
    const updated = {
      ...settings,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    setSettings(updated);
    await syncToFirestore('settings', 'general', cleanForFirestore(updated) as unknown as Record<string, unknown>);
  };

  const setActivePhase = async (phase: EventPhase) => {
    await updateSettings({ activePhase: phase });
  };

  // Topics
  const addTopic = async (data: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `topic-${Date.now()}`;
    const now = new Date().toISOString();
    const newTopic: Topic = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setTopics((prev) => [...prev, newTopic].sort((a, b) => a.displayOrder - b.displayOrder));
    await syncToFirestore('topics', id, cleanForFirestore(newTopic) as unknown as Record<string, unknown>);
    return id;
  };

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    const now = new Date().toISOString();
    let fullItem: Topic | undefined;
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          fullItem = { ...t, ...updates, updatedAt: now };
          return fullItem;
        }
        return t;
      })
    );
    const dataToSave = fullItem || { ...updates, updatedAt: now };
    await syncToFirestore('topics', id, cleanForFirestore(dataToSave) as unknown as Record<string, unknown>);
  };

  const deleteTopic = async (id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
    // Soft clean or remove orphaned subtopics
    setSubtopics((prev) => prev.filter((st) => st.topicId !== id));
    await deleteFromFirestore('topics', id);
  };

  const reorderTopic = async (id: string, direction: 'up' | 'down') => {
    const index = topics.findIndex((t) => t.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === topics.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...topics];
    const current = reordered[index];
    const target = reordered[targetIndex];

    const currentOrder = current.displayOrder;
    current.displayOrder = target.displayOrder;
    target.displayOrder = currentOrder;

    reordered.sort((a, b) => a.displayOrder - b.displayOrder);
    setTopics(reordered);
    await syncToFirestore('topics', current.id, cleanForFirestore(current) as unknown as Record<string, unknown>);
    await syncToFirestore('topics', target.id, cleanForFirestore(target) as unknown as Record<string, unknown>);
  };

  // Subtopics
  const addSubtopic = async (data: Omit<Subtopic, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `sub-${Date.now()}`;
    const now = new Date().toISOString();
    const newSub: Subtopic = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setSubtopics((prev) => [...prev, newSub].sort((a, b) => a.displayOrder - b.displayOrder));
    await syncToFirestore('subtopics', id, cleanForFirestore(newSub) as unknown as Record<string, unknown>);
    return id;
  };

  const updateSubtopic = async (id: string, updates: Partial<Subtopic>) => {
    const now = new Date().toISOString();
    let fullItem: Subtopic | undefined;
    setSubtopics((prev) =>
      prev.map((st) => {
        if (st.id === id) {
          fullItem = { ...st, ...updates, updatedAt: now };
          return fullItem;
        }
        return st;
      })
    );
    const dataToSave = fullItem || { ...updates, updatedAt: now };
    await syncToFirestore('subtopics', id, cleanForFirestore(dataToSave) as unknown as Record<string, unknown>);
  };

  const deleteSubtopic = async (id: string) => {
    setSubtopics((prev) => prev.filter((st) => st.id !== id));
    await deleteFromFirestore('subtopics', id);
  };

  const reorderSubtopic = async (id: string, direction: 'up' | 'down') => {
    const sub = subtopics.find((s) => s.id === id);
    if (!sub) return;

    // Filter subtopics of same topic
    const siblings = subtopics
      .filter((s) => s.topicId === sub.topicId)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const index = siblings.findIndex((s) => s.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === siblings.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const current = siblings[index];
    const target = siblings[targetIndex];

    const currentOrder = current.displayOrder;
    current.displayOrder = target.displayOrder;
    target.displayOrder = currentOrder;

    setSubtopics((prev) =>
      prev.map((s) => {
        if (s.id === current.id) return { ...s, displayOrder: current.displayOrder };
        if (s.id === target.id) return { ...s, displayOrder: target.displayOrder };
        return s;
      })
    );

    await syncToFirestore('subtopics', current.id, { displayOrder: current.displayOrder });
    await syncToFirestore('subtopics', target.id, { displayOrder: target.displayOrder });
  };

  // Announcements
  const addAnnouncement = async (
    data: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>
  ): Promise<string> => {
    const id = `ann-${Date.now()}`;
    const now = new Date().toISOString();
    const newAnn: Announcement = {
      ...data,
      id,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    await syncToFirestore('announcements', id, cleanForFirestore(newAnn) as unknown as Record<string, unknown>);
    return id;
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const now = new Date().toISOString();
    let fullItem: Announcement | undefined;
    setAnnouncements((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          fullItem = { ...a, ...updates, updatedAt: now };
          return fullItem;
        }
        return a;
      })
    );
    const dataToSave = fullItem || { ...updates, updatedAt: now };
    await syncToFirestore('announcements', id, cleanForFirestore(dataToSave) as unknown as Record<string, unknown>);
  };

  const deleteAnnouncement = async (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    await deleteFromFirestore('announcements', id);
  };

  const togglePinAnnouncement = async (id: string) => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;
    await updateAnnouncement(id, { isPinned: !ann.isPinned });
  };

  // Events
  const addEvent = async (data: Omit<EventItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `event-${Date.now()}`;
    const now = new Date().toISOString();
    const newEvent: EventItem = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setEvents((prev) => [...prev, newEvent].sort((a, b) => a.displayOrder - b.displayOrder));
    await syncToFirestore('events', id, cleanForFirestore(newEvent) as unknown as Record<string, unknown>);
    return id;
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    const now = new Date().toISOString();
    let fullItem: EventItem | undefined;
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          fullItem = { ...e, ...updates, updatedAt: now };
          return fullItem;
        }
        return e;
      })
    );
    const dataToSave = fullItem || { ...updates, updatedAt: now };
    await syncToFirestore('events', id, cleanForFirestore(dataToSave) as unknown as Record<string, unknown>);
  };

  const deleteEvent = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    await deleteFromFirestore('events', id);
  };

  // Schedules
  const addSchedule = async (data: Omit<ScheduleItem, 'id'>): Promise<string> => {
    const id = `sch-${Date.now()}`;
    const newSchedule: ScheduleItem = {
      ...data,
      id,
    };
    setSchedules((prev) => [...prev, newSchedule]);
    await syncToFirestore('schedules', id, cleanForFirestore(newSchedule) as unknown as Record<string, unknown>);
    return id;
  };

  const updateSchedule = async (id: string, updates: Partial<ScheduleItem>) => {
    let fullItem: ScheduleItem | undefined;
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          fullItem = { ...s, ...updates };
          return fullItem;
        }
        return s;
      })
    );
    const dataToSave = fullItem || updates;
    await syncToFirestore('schedules', id, cleanForFirestore(dataToSave) as unknown as Record<string, unknown>);
  };

  const deleteSchedule = async (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    await deleteFromFirestore('schedules', id);
  };

  // Infographics
  const addInfographic = async (data: Omit<Infographic, 'id' | 'uploadedAt'>): Promise<string> => {
    const id = `info-${Date.now()}`;
    const now = new Date().toISOString();
    // Shift existing items by +1 so the newest item is 1st from the left
    const shifted = infographics.map((item, idx) => ({
      ...item,
      displayOrder: idx + 2,
    }));
    for (const item of shifted) {
      await syncToFirestore('infographics', item.id, { displayOrder: item.displayOrder });
    }
    const newInfo: Infographic = {
      ...data,
      id,
      displayOrder: 1,
      uploadedAt: now,
      updatedAt: now,
    };
    setInfographics([newInfo, ...shifted]);
    await syncToFirestore('infographics', id, cleanForFirestore(newInfo) as unknown as Record<string, unknown>);
    return id;
  };

  const updateInfographic = async (id: string, updates: Partial<Infographic>) => {
    const now = new Date().toISOString();
    let fullItem: Infographic | undefined;
    setInfographics((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          fullItem = { ...item, ...updates, updatedAt: now };
          return fullItem;
        }
        return item;
      })
    );
    const dataToSave = fullItem || { ...updates, updatedAt: now };
    await syncToFirestore('infographics', id, cleanForFirestore(dataToSave) as unknown as Record<string, unknown>);
  };

  const reorderInfographic = async (id: string, direction: 'left' | 'right') => {
    // Current sorted list (1st from left = index 0)
    const sorted = [...infographics].sort((a, b) => {
      const orderA = a.displayOrder ?? 999;
      const orderB = b.displayOrder ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      const timeA = new Date(a.updatedAt || a.uploadedAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.uploadedAt || 0).getTime();
      return timeB - timeA;
    });

    const index = sorted.findIndex((item) => item.id === id);
    if (index === -1) return;
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === sorted.length - 1) return;

    const targetIndex = direction === 'left' ? index - 1 : index + 1;

    // Swap items in array
    const itemA = sorted[index];
    const itemB = sorted[targetIndex];
    sorted[index] = itemB;
    sorted[targetIndex] = itemA;

    // Normalize displayOrder: 1, 2, 3...
    const updatedList = sorted.map((item, idx) => ({
      ...item,
      displayOrder: idx + 1,
    }));

    setInfographics(updatedList);

    // Sync changed orders to Firestore
    await syncToFirestore('infographics', itemA.id, { displayOrder: targetIndex + 1 });
    await syncToFirestore('infographics', itemB.id, { displayOrder: index + 1 });
  };

  const deleteInfographic = async (id: string) => {
    setInfographics((prev) => prev.filter((item) => item.id !== id));
    await deleteFromFirestore('infographics', id);
  };

  // Documents
  const addDocument = async (data: Omit<DocumentItem, 'id' | 'updatedAt'>): Promise<string> => {
    const id = `doc-${Date.now()}`;
    const now = new Date().toISOString();
    const newDoc: DocumentItem = {
      ...data,
      id,
      updatedAt: now,
    };
    setDocuments((prev) => [newDoc, ...prev]);
    await syncToFirestore('documents', id, cleanForFirestore(newDoc) as unknown as Record<string, unknown>);
    return id;
  };

  const updateDocument = async (id: string, updates: Partial<DocumentItem>) => {
    const now = new Date().toISOString();
    let fullItem: DocumentItem | undefined;
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          fullItem = { ...d, ...updates, updatedAt: now };
          return fullItem;
        }
        return d;
      })
    );
    const dataToSave = fullItem || { ...updates, updatedAt: now };
    await syncToFirestore('documents', id, cleanForFirestore(dataToSave) as unknown as Record<string, unknown>);
  };

  const deleteDocument = async (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await deleteFromFirestore('documents', id);
  };

  // Travel Info
  const updateTravelInfo = async (updates: Partial<TravelAccommodationInfo>) => {
    const updated = {
      ...travelInfo,
      ...updates,
    };
    setTravelInfo(updated);
    await syncToFirestore('settings', 'travelAccommodation', updated as unknown as Record<string, unknown>);
  };

  const resetToInitialData = async () => {
    setSettings(initialSettings);
    setTopics(initialTopics);
    setSubtopics(initialSubtopics);
    setAnnouncements(initialAnnouncements);
    setEvents(initialEvents);
    setSchedules(initialSchedules);
    setInfographics(initialInfographics);
    setDocuments(initialDocuments);
    setTravelInfo(initialTravelInfo);
    try {
      localStorage.removeItem(STORAGE_KEY);
      if (isFirebaseConfigured && db) {
        await setDoc(doc(db, 'settings', 'general'), initialSettings);
        await setDoc(doc(db, 'settings', 'travelAccommodation'), initialTravelInfo);
        for (const item of initialTopics) {
          await setDoc(doc(db, 'topics', item.id), item);
        }
        for (const item of initialSubtopics) {
          await setDoc(doc(db, 'subtopics', item.id), item);
        }
        for (const item of initialAnnouncements) {
          await setDoc(doc(db, 'announcements', item.id), item);
        }
        for (const item of initialEvents) {
          await setDoc(doc(db, 'events', item.id), item);
        }
        for (const item of initialSchedules) {
          await setDoc(doc(db, 'schedules', item.id), item);
        }
        for (const item of initialInfographics) {
          await setDoc(doc(db, 'infographics', item.id), item);
        }
        for (const item of initialDocuments) {
          await setDoc(doc(db, 'documents', item.id), item);
        }
        setIsCloudSyncActive(true);
        setCloudSyncLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Reset error:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        topics,
        subtopics,
        announcements,
        events,
        schedules,
        infographics,
        documents,
        travelInfo,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedEventFilter,
        setSelectedEventFilter,
        selectedTopicFilter,
        setSelectedTopicFilter,
        isCloudSyncActive,
        cloudSyncLastUpdated,
        updateSettings,
        setActivePhase,
        addTopic,
        updateTopic,
        deleteTopic,
        reorderTopic,
        addSubtopic,
        updateSubtopic,
        deleteSubtopic,
        reorderSubtopic,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        togglePinAnnouncement,
        addEvent,
        updateEvent,
        deleteEvent,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        addInfographic,
        updateInfographic,
        deleteInfographic,
        reorderInfographic,
        addDocument,
        updateDocument,
        deleteDocument,
        updateTravelInfo,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
