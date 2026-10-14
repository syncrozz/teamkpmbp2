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
} from '../data/initialData';
import { db, isFirebaseConfigured, auth } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  doc,
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

  const { user } = useAuth();

  // Connect to Firestore real-time listeners if configured and auth is present
  useEffect(() => {
    // Only attach live snapshot listeners if auth is ready and user is authenticated
    if (!isFirebaseConfigured || !db || !auth?.currentUser) return;

    let unsubTopics: (() => void) | undefined;
    let unsubSubtopics: (() => void) | undefined;
    let unsubAnn: (() => void) | undefined;
    let unsubEvents: (() => void) | undefined;

    try {
      unsubTopics = onSnapshot(
        collection(db, 'topics'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Topic));
            setTopics(list.sort((a, b) => a.displayOrder - b.displayOrder));
          }
        },
        (error) => {
          console.warn('[Firestore] topics snapshot listener error:', error.message);
        }
      );

      unsubSubtopics = onSnapshot(
        collection(db, 'subtopics'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Subtopic));
            setSubtopics(list.sort((a, b) => a.displayOrder - b.displayOrder));
          }
        },
        (error) => {
          console.warn('[Firestore] subtopics snapshot listener error:', error.message);
        }
      );

      unsubAnn = onSnapshot(
        collection(db, 'announcements'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Announcement));
            setAnnouncements(
              list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
            );
          }
        },
        (error) => {
          console.warn('[Firestore] announcements snapshot listener error:', error.message);
        }
      );

      unsubEvents = onSnapshot(
        collection(db, 'events'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as EventItem));
            setEvents(list.sort((a, b) => a.displayOrder - b.displayOrder));
          }
        },
        (error) => {
          console.warn('[Firestore] events snapshot listener error:', error.message);
        }
      );
    } catch (e) {
      console.warn('Firestore snapshot setup error:', e);
    }

    return () => {
      unsubTopics?.();
      unsubSubtopics?.();
      unsubAnn?.();
      unsubEvents?.();
    };
  }, [user]);

  // Sync item to Firestore if configured and authenticated
  const syncToFirestore = async (collectionName: string, id: string, data: Record<string, unknown>) => {
    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        await setDoc(doc(db, collectionName, id), data, { merge: true });
      } catch (err) {
        console.warn(`[Firestore] Sync error on ${collectionName}/${id}:`, err);
      }
    }
  };

  const deleteFromFirestore = async (collectionName: string, id: string) => {
    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        await deleteDoc(doc(db, collectionName, id));
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
    await syncToFirestore('settings', 'general', updated);
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
    await syncToFirestore('topics', id, newTopic as unknown as Record<string, unknown>);
    return id;
  };

  const updateTopic = async (id: string, updates: Partial<Topic>) => {
    const now = new Date().toISOString();
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: now } : t))
    );
    await syncToFirestore('topics', id, { ...updates, updatedAt: now });
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
    await syncToFirestore('topics', current.id, { displayOrder: current.displayOrder });
    await syncToFirestore('topics', target.id, { displayOrder: target.displayOrder });
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
    await syncToFirestore('subtopics', id, newSub as unknown as Record<string, unknown>);
    return id;
  };

  const updateSubtopic = async (id: string, updates: Partial<Subtopic>) => {
    const now = new Date().toISOString();
    setSubtopics((prev) =>
      prev.map((st) => (st.id === id ? { ...st, ...updates, updatedAt: now } : st))
    );
    await syncToFirestore('subtopics', id, { ...updates, updatedAt: now });
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
    await syncToFirestore('announcements', id, newAnn as unknown as Record<string, unknown>);
    return id;
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const now = new Date().toISOString();
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: now } : a))
    );
    await syncToFirestore('announcements', id, { ...updates, updatedAt: now });
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
    await syncToFirestore('events', id, newEvent as unknown as Record<string, unknown>);
    return id;
  };

  const updateEvent = async (id: string, updates: Partial<EventItem>) => {
    const now = new Date().toISOString();
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: now } : e))
    );
    await syncToFirestore('events', id, { ...updates, updatedAt: now });
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
    await syncToFirestore('schedules', id, newSchedule as unknown as Record<string, unknown>);
    return id;
  };

  const updateSchedule = async (id: string, updates: Partial<ScheduleItem>) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    await syncToFirestore('schedules', id, updates);
  };

  const deleteSchedule = async (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    await deleteFromFirestore('schedules', id);
  };

  // Infographics
  const addInfographic = async (data: Omit<Infographic, 'id' | 'uploadedAt'>): Promise<string> => {
    const id = `info-${Date.now()}`;
    const now = new Date().toISOString();
    const newInfo: Infographic = {
      ...data,
      id,
      uploadedAt: now,
    };
    setInfographics((prev) => [newInfo, ...prev]);
    await syncToFirestore('infographics', id, newInfo as unknown as Record<string, unknown>);
    return id;
  };

  const updateInfographic = async (id: string, updates: Partial<Infographic>) => {
    setInfographics((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
    await syncToFirestore('infographics', id, updates);
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
    await syncToFirestore('documents', id, newDoc as unknown as Record<string, unknown>);
    return id;
  };

  const updateDocument = async (id: string, updates: Partial<DocumentItem>) => {
    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: now } : d))
    );
    await syncToFirestore('documents', id, { ...updates, updatedAt: now });
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

  const resetToInitialData = () => {
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
    } catch (e) {
      console.error(e);
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
