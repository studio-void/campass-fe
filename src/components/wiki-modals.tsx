import { useEffect, useState } from 'react';

import { Calendar, Edit, History, User, X } from 'lucide-react';

import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type UpdateWikiRequest,
  type Wiki,
  type WikiHistory,
  getWikiById,
  getWikiHistory,
  updateWiki,
} from '@/data/wiki';

// Wiki Detail Modal
interface WikiDetailModalProps {
  wikiId: number;
  onClose: () => void;
  onEdit: () => void;
  onHistory: () => void;
  currentUser: any;
}

export function WikiDetailModal({
  wikiId,
  onClose,
  onEdit,
  onHistory,
  currentUser,
}: WikiDetailModalProps) {
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWiki = async () => {
      const wikiData = await getWikiById(wikiId);
      setWiki(wikiData);
      setLoading(false);
    };
    loadWiki();
  }, [wikiId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!wiki) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2">Wiki not found</h3>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const isAuthor = currentUser?.id === wiki.authorId;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">{wiki.title}</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onHistory}
              className="text-gray-600 hover:text-gray-900"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            {isAuthor && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-800"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-4 border-b">
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                <User className="w-4 h-4 mr-1" />
                <span className="font-medium">
                  {wiki.author?.name || 'Author'}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Created: {formatDate(wiki.createdAt)}</span>
              </div>
              {wiki.updatedAt !== wiki.createdAt && (
                <div className="flex items-center">
                  <Edit className="w-4 h-4 mr-1" />
                  <span>Updated: {formatDate(wiki.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <MarkdownRenderer
              content={wiki.content}
              className="text-gray-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Wiki Edit Modal
interface WikiEditModalProps {
  wikiId: number;
  onClose: () => void;
  onSave: (updatedWiki: Wiki) => void;
}

export function WikiEditModal({ wikiId, onClose, onSave }: WikiEditModalProps) {
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    const loadWiki = async () => {
      const wikiData = await getWikiById(wikiId);
      setWiki(wikiData);
      if (wikiData) {
        setEditTitle(wikiData.title);
        setEditContent(wikiData.content);
      }
      setLoading(false);
    };
    loadWiki();
  }, [wikiId]);

  const handleSave = async () => {
    if (!wiki || !editTitle.trim() || !editContent.trim()) {
      return;
    }

    setSaving(true);

    const updateData: UpdateWikiRequest = {
      title: editTitle,
      content: editContent,
      comment: editComment || 'Content updated',
    };

    const result = await updateWiki(wiki.id, updateData);

    if (result) {
      onSave(result);
    }

    setSaving(false);
  };

  const hasChanges = () => {
    if (!wiki) return false;
    return editTitle !== wiki.title || editContent !== wiki.content;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!wiki) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-md">
          <h3 className="text-lg font-semibold mb-2">Wiki not found</h3>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Wiki</h2>
            <p className="text-gray-600 text-sm">
              Make changes to your wiki content
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !hasChanges() ||
                !editTitle.trim() ||
                !editContent.trim()
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <Label
              htmlFor="edit-title"
              className="text-sm font-medium text-gray-700"
            >
              Title
            </Label>
            <Input
              id="edit-title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter wiki title"
              className="mt-1"
            />
          </div>

          <div>
            <Label
              htmlFor="edit-content"
              className="text-sm font-medium text-gray-700"
            >
              Content
            </Label>
            <textarea
              id="edit-content"
              className="mt-1 w-full min-h-[400px] p-3 border border-gray-300 rounded-md resize-vertical font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Enter wiki content"
            />
          </div>

          <div>
            <Label
              htmlFor="edit-comment"
              className="text-sm font-medium text-gray-700"
            >
              Edit Comment (optional)
            </Label>
            <Input
              id="edit-comment"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Brief description of changes made"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              This will help others understand what you changed.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !hasChanges() ||
                !editTitle.trim() ||
                !editContent.trim()
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wiki History Modal
interface WikiHistoryModalProps {
  wikiId: number;
  onClose: () => void;
}

export function WikiHistoryModal({ wikiId, onClose }: WikiHistoryModalProps) {
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [history, setHistory] = useState<WikiHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [wikiData, historyData] = await Promise.all([
        getWikiById(wikiId),
        getWikiHistory(wikiId),
      ]);
      setWiki(wikiData);
      setHistory(historyData);
      setLoading(false);
    };
    loadData();
  }, [wikiId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {wiki?.title} - Edit History
            </h2>
            <p className="text-gray-600">View all changes made to this wiki</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No edit history</h3>
              <p className="text-gray-600">
                No edit records found for this wiki.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((entry, index) => (
                <Card
                  key={entry.id}
                  className="relative border-l-4 border-l-blue-500"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        {index === 0 ? (
                          <>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                              Current Version
                            </span>
                            Current Version
                          </>
                        ) : (
                          `Version ${history.length - index}`
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center bg-gray-100 px-2 py-1 rounded">
                          <User className="w-4 h-4 mr-1" />
                          <span className="font-medium">
                            {entry.editor.name}
                          </span>
                          <span className="text-gray-400 ml-1">
                            (@{entry.editor.nickname})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(entry.editedAt)}</span>
                        </div>
                      </div>
                    </div>
                    {entry.comment && (
                      <div className="flex items-center text-sm text-gray-600 bg-blue-50 p-2 rounded">
                        <span className="font-medium">Edit comment:</span>
                        <span className="ml-2 italic">{entry.comment}</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-md p-4 border">
                      <div className="max-h-60 overflow-y-auto">
                        <MarkdownRenderer
                          content={entry.content}
                          className="prose-sm text-gray-700"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
