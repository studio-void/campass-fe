import { useEffect, useState } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Save } from 'lucide-react';

import { MarkdownEditor } from '@/components/markdown-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  type UpdateWikiRequest,
  type Wiki,
  getWikiById,
  updateWiki,
} from '@/data/wiki';

function WikiEditPage() {
  const { wikiId } = useParams({ from: '/wiki/$wikiId/edit' });
  const navigate = useNavigate();
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!wikiId) return;

      try {
        const wikiData = await getWikiById(parseInt(wikiId));
        setWiki(wikiData);

        if (wikiData) {
          setEditTitle(wikiData.title);
          setEditContent(wikiData.content);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
      navigate({ to: '/wiki/$wikiId', params: { wikiId: wiki.id.toString() } });
    }

    setSaving(false);
  };

  const hasChanges = () => {
    if (!wiki) return false;
    return editTitle !== wiki.title || editContent !== wiki.content;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!wiki) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Wiki not found</h2>
        <p className="text-muted-foreground mb-4">
          The requested wiki does not exist or has been deleted.
        </p>
        <Button onClick={() => navigate({ to: '/wiki' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Wiki List
        </Button>
      </div>
    );
  }

  // 위키는 누구나 편집할 수 있습니다

  return (
    <div className="space-y-6 mb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() =>
            navigate({
              to: '/wiki/$wikiId',
              params: { wikiId: wiki.id.toString() },
            })
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Wiki
        </Button>

        <Button
          onClick={handleSave}
          disabled={
            saving || !hasChanges() || !editTitle.trim() || !editContent.trim()
          }
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Wiki</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter wiki title"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content</Label>
            <MarkdownEditor
              value={editContent}
              onChange={setEditContent}
              placeholder="Enter wiki content in markdown format"
              id="content"
            />
          </div>

          {/* Edit comment */}
          <div>
            <Label htmlFor="comment">Edit Comment (Optional)</Label>
            <Input
              id="comment"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="Enter a brief description of this edit"
            />
          </div>

          {/* Save buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                navigate({
                  to: '/wiki/$wikiId',
                  params: { wikiId: wiki.id.toString() },
                })
              }
            >
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
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WikiEditPage;
