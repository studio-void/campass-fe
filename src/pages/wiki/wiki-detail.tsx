import { useEffect, useState } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Calendar, Edit, History, Trash2, User } from 'lucide-react';

import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUser } from '@/data/get-user';
import { type Wiki, deleteWiki, getWikiById } from '@/data/wiki';

// Simple confirmation dialog implementation
function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function WikiDetailPage() {
  const { wikiId } = useParams({ from: '/wiki/$wikiId' });
  const navigate = useNavigate();
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!wikiId) return;

      try {
        const [wikiData, userData] = await Promise.all([
          getWikiById(parseInt(wikiId)),
          getUser(),
        ]);
        setWiki(wikiData);
        setCurrentUser(userData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [wikiId]);

  const handleDeleteWiki = async () => {
    if (!wiki) return;

    const success = await deleteWiki(wiki.id);
    if (success) {
      navigate({ to: '/wiki' });
    }
  };

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

  const isAuthor = currentUser?.id === wiki.authorId;

  return (
    <div className="space-y-6 mb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate({ to: '/wiki' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Wiki List
        </Button>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              navigate({
                to: '/wiki/$wikiId/history',
                params: { wikiId: wiki.id.toString() },
              });
            }}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>

          {/* Anyone can edit */}
          <Button
            variant="outline"
            onClick={() =>
              navigate({
                to: '/wiki/$wikiId/edit',
                params: { wikiId: wiki.id.toString() },
              })
            }
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>

          {/* Only author can delete */}
          {isAuthor && (
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Wiki Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{wiki.title}</CardTitle>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1" />
                <span>{wiki.author?.name || 'Author'}</span>
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
        </CardHeader>
        <CardContent>
          <MarkdownRenderer content={wiki.content} />
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteWiki}
        title="Delete this wiki?"
        description="This action cannot be undone. The wiki and all edit history will be permanently deleted."
      />
    </div>
  );
}

export default WikiDetailPage;
