import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Topic, Subtopic } from '../../types';
import { InlineEdit } from '../common/InlineEdit';
import {
  Compass,
  Award,
  Bus,
  Shield,
  FileText,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  FolderInput,
  X,
  AlertCircle,
} from 'lucide-react';
import { SectionLinkButton } from '../common/SectionLinkButton';

const iconMap: Record<string, React.ElementType> = {
  Compass,
  Award,
  Bus,
  Shield,
  FileText,
};

export const TopicSection: React.FC = () => {
  const {
    topics,
    subtopics,
    addTopic,
    updateTopic,
    deleteTopic,
    reorderTopic,
    addSubtopic,
    updateSubtopic,
    deleteSubtopic,
    reorderSubtopic,
    searchQuery,
  } = useApp();
  const { isAdminMode } = useAuth();

  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({
    'topic-general-briefing': true,
    'topic-competitions': true,
  });

  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicIcon, setNewTopicIcon] = useState('Compass');

  const [addingSubtopicForId, setAddingSubtopicForId] = useState<string | null>(null);
  const [newSubTitle, setNewSubTitle] = useState('');
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubContent, setNewSubContent] = useState('');

  // Move subtopic modal state
  const [movingSubtopic, setMovingSubtopic] = useState<Subtopic | null>(null);
  const [targetTopicId, setTargetTopicId] = useState<string>('');

  const toggleExpand = (id: string) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim()) return;

    await addTopic({
      title: newTopicTitle.trim(),
      description: newTopicDesc.trim(),
      iconName: newTopicIcon,
      displayOrder: topics.length + 1,
      status: 'published',
      featured: true,
    });

    setNewTopicTitle('');
    setNewTopicDesc('');
    setIsAddingTopic(false);
  };

  const handleCreateSubtopic = async (topicId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubTitle.trim()) return;

    const currentSubs = subtopics.filter((s) => s.topicId === topicId);
    await addSubtopic({
      topicId,
      title: newSubTitle.trim(),
      description: newSubDesc.trim(),
      content: newSubContent.trim() || newSubDesc.trim(),
      displayOrder: currentSubs.length + 1,
      status: 'published',
    });

    setNewSubTitle('');
    setNewSubDesc('');
    setNewSubContent('');
    setAddingSubtopicForId(null);
    setExpandedTopics((prev) => ({ ...prev, [topicId]: true }));
  };

  const handleMoveSubtopic = async () => {
    if (!movingSubtopic || !targetTopicId || targetTopicId === movingSubtopic.topicId) {
      setMovingSubtopic(null);
      return;
    }
    await updateSubtopic(movingSubtopic.id, { topicId: targetTopicId });
    setMovingSubtopic(null);
  };

  // Filter topics based on search or public status
  const visibleTopics = topics.filter((t) => {
    if (!isAdminMode && t.status !== 'published') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
      const matchSub = subtopics.some(
        (s) =>
          s.topicId === t.id &&
          (s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.content.toLowerCase().includes(q))
      );
      return matchTopic || matchSub;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Contingent Topics & Briefing Packs
          </h2>
          <p className="text-xs text-slate-500">
            Database-driven guidelines, rehearsal rules and operational policies
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SectionLinkButton slug="topik" />

          {isAdminMode && (
            <button
              onClick={() => setIsAddingTopic(true)}
              className="min-h-[34px] px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Topic Form (Admin Mode) */}
      {isAdminMode && isAddingTopic && (
        <form
          onSubmit={handleCreateTopic}
          className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-900">Add New Topic Category</span>
            <button
              type="button"
              onClick={() => setIsAddingTopic(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Topic Title *
              </label>
              <input
                type="text"
                value={newTopicTitle}
                onChange={(e) => setNewTopicTitle(e.target.value)}
                required
                placeholder="e.g. Media Guidelines & Photography Accreditation"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Icon
              </label>
              <select
                value={newTopicIcon}
                onChange={(e) => setNewTopicIcon(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              >
                <option value="Compass">Compass (Navigation)</option>
                <option value="Award">Award (Competition)</option>
                <option value="Bus">Bus (Logistics)</option>
                <option value="Shield">Shield (Welfare)</option>
                <option value="FileText">File (Document)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Short Description
            </label>
            <textarea
              value={newTopicDesc}
              onChange={(e) => setNewTopicDesc(e.target.value)}
              rows={2}
              placeholder="Brief description of this section's scope."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddingTopic(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Create Topic
            </button>
          </div>
        </form>
      )}

      {/* Empty State */}
      {visibleTopics.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-900">No Topics Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No topics match "${searchQuery}".`
              : 'No topics are published yet.'}
          </p>
        </div>
      )}

      {/* Topics Hierarchy */}
      <div className="space-y-4">
        {visibleTopics.map((topic, index) => {
          const Icon = iconMap[topic.iconName] || Compass;
          const isExpanded = Boolean(expandedTopics[topic.id]);

          // Filter subtopics for this topic
          const topicSubs = subtopics
            .filter((s) => s.topicId === topic.id)
            .filter((s) => isAdminMode || s.status === 'published')
            .sort((a, b) => a.displayOrder - b.displayOrder);

          return (
            <div
              key={topic.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-xs"
            >
              {/* Topic Header */}
              <div className="p-4 sm:p-5 flex items-start justify-between gap-4 bg-slate-50/50 border-b border-slate-100">
                <div
                  className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
                  onClick={() => toggleExpand(topic.id)}
                >
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl text-blue-600 shrink-0 mt-0.5">
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-0.5">
                      <span className="font-semibold text-slate-700">Topic #{index + 1}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span>{topicSubs.length} subtopics</span>
                      {isAdminMode && (
                        <>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span
                            className={`text-[10px] uppercase font-bold ${
                              topic.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                            }`}
                          >
                            {topic.status}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900">
                      <InlineEdit
                        value={topic.title}
                        onSave={(val) => updateTopic(topic.id, { title: val })}
                        as="span"
                      />
                    </h3>

                    <div className="text-xs text-slate-600 mt-0.5">
                      <InlineEdit
                        value={topic.description}
                        onSave={(val) => updateTopic(topic.id, { description: val })}
                        multiline
                        as="p"
                      />
                    </div>
                  </div>
                </div>

                {/* Topic Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  {isAdminMode && (
                    <>
                      <button
                        onClick={() => reorderTopic(topic.id, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md"
                        title="Move topic up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => reorderTopic(topic.id, 'down')}
                        disabled={index === visibleTopics.length - 1}
                        className="p-1.5 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded-md"
                        title="Move topic down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          updateTopic(topic.id, {
                            status: topic.status === 'published' ? 'draft' : 'published',
                          })
                        }
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                        title={topic.status === 'published' ? 'Hide topic' : 'Publish topic'}
                      >
                        {topic.status === 'published' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete topic "${topic.title}" and its ${topicSubs.length} subtopics?`
                            )
                          ) {
                            deleteTopic(topic.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                        title="Delete topic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => toggleExpand(topic.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Subtopics Accordion Content */}
              {isExpanded && (
                <div className="p-4 sm:p-5 space-y-3 bg-white">
                  {topicSubs.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">
                      No subtopics recorded under this topic yet.
                    </p>
                  )}

                  {topicSubs.map((sub, subIndex) => (
                    <div
                      key={sub.id}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1">
                            <span className="font-semibold text-slate-700">
                              Subtopic {subIndex + 1}
                            </span>
                            {isAdminMode && (
                              <>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span
                                  className={`uppercase font-bold ${
                                    sub.status === 'published' ? 'text-emerald-600' : 'text-amber-600'
                                  }`}
                                >
                                  {sub.status}
                                </span>
                              </>
                            )}
                          </div>

                          <h4 className="text-sm font-bold text-slate-900">
                            <InlineEdit
                              value={sub.title}
                              onSave={(val) => updateSubtopic(sub.id, { title: val })}
                              as="span"
                            />
                          </h4>

                          <div className="text-xs text-slate-600 mt-1">
                            <InlineEdit
                              value={sub.description}
                              onSave={(val) => updateSubtopic(sub.id, { description: val })}
                              multiline
                              as="p"
                            />
                          </div>

                          {/* Rich Content block */}
                          <div className="mt-2 p-2.5 bg-white border border-slate-200/80 rounded-lg text-xs text-slate-700 leading-relaxed">
                            <InlineEdit
                              value={sub.content}
                              onSave={(val) => updateSubtopic(sub.id, { content: val })}
                              multiline
                              as="div"
                            />
                          </div>
                        </div>

                        {/* Subtopic Admin Controls */}
                        {isAdminMode && (
                          <div className="flex items-center gap-1 shrink-0 pt-1">
                            <button
                              onClick={() => reorderSubtopic(sub.id, 'up')}
                              disabled={subIndex === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => reorderSubtopic(sub.id, 'down')}
                              disabled={subIndex === topicSubs.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Move down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setMovingSubtopic(sub);
                                setTargetTopicId(sub.topicId);
                              }}
                              className="p-1 text-slate-400 hover:text-blue-600"
                              title="Move to another topic"
                            >
                              <FolderInput className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                updateSubtopic(sub.id, {
                                  status: sub.status === 'published' ? 'draft' : 'published',
                                })
                              }
                              className="p-1 text-slate-400 hover:text-slate-700"
                              title={sub.status === 'published' ? 'Hide subtopic' : 'Publish subtopic'}
                            >
                              {sub.status === 'published' ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete subtopic "${sub.title}"?`)) {
                                  deleteSubtopic(sub.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Delete subtopic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Subtopic Trigger & Inline Form */}
                  {isAdminMode && (
                    <div className="pt-2">
                      {addingSubtopicForId === topic.id ? (
                        <form
                          onSubmit={(e) => handleCreateSubtopic(topic.id, e)}
                          className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5"
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                            <span className="text-xs font-semibold text-slate-800">
                              Add Subtopic to {topic.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => setAddingSubtopicForId(null)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div>
                            <input
                              type="text"
                              value={newSubTitle}
                              onChange={(e) => setNewSubTitle(e.target.value)}
                              placeholder="Subtopic Title *"
                              required
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              value={newSubDesc}
                              onChange={(e) => setNewSubDesc(e.target.value)}
                              placeholder="Brief description / scope"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                            />
                          </div>

                          <div>
                            <textarea
                              value={newSubContent}
                              onChange={(e) => setNewSubContent(e.target.value)}
                              rows={2}
                              placeholder="Rich content instructions, bullet points, venue rules..."
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                            />
                          </div>

                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setAddingSubtopicForId(null)}
                              className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-semibold hover:bg-blue-700"
                            >
                              Add Subtopic
                            </button>
                          </div>
                        </form>
                      ) : (
                        <button
                          onClick={() => setAddingSubtopicForId(topic.id)}
                          className="w-full py-2 border border-dashed border-slate-200 hover:border-blue-400 rounded-xl text-xs font-medium text-slate-600 hover:text-blue-600 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Subtopic</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Move Subtopic Modal */}
      {movingSubtopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMovingSubtopic(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 z-10">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Move Subtopic
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Move <span className="font-semibold text-slate-800">"{movingSubtopic.title}"</span> to another parent topic:
            </p>

            <select
              value={targetTopicId}
              onChange={(e) => setTargetTopicId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} {t.id === movingSubtopic.topicId ? '(Current)' : ''}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMovingSubtopic(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveSubtopic}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
              >
                Save Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
