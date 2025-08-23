import { useEffect, useState } from 'react';

import {
  Calendar,
  Edit,
  FileText,
  History,
  Plus,
  Trash2,
  Upload,
  User,
} from 'lucide-react';

import { DocumentParser } from '@/components/document-parser';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  WikiDetailModal,
  WikiEditModal,
  WikiHistoryModal,
} from '@/components/wiki-modals';
import { type Wiki, createWiki, deleteWiki, getWikis } from '@/data/wiki';
import { useCurrentUser } from '@/hooks/use-current-user';

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

function WikiIndexPage() {
  const [wikis, setWikis] = useState<Wiki[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useCurrentUser();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWikiTitle, setNewWikiTitle] = useState('');
  const [newWikiContent, setNewWikiContent] = useState('');
  const [creatingWiki, setCreatingWiki] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [wikiToDelete, setWikiToDelete] = useState<number | null>(null);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);

  useEffect(() => {
    const loadWikis = async () => {
      try {
        const wikiData = await getWikis();
        setWikis(wikiData);
      } finally {
        setLoading(false);
      }
    };

    loadWikis();
  }, []);

  const handleCreateWiki = async () => {
    if (!newWikiTitle.trim() || !newWikiContent.trim()) {
      return;
    }

    setCreatingWiki(true);
    const result = await createWiki({
      title: newWikiTitle,
      content: newWikiContent,
    });

    if (result) {
      setWikis([result, ...wikis]);
      setNewWikiTitle('');
      setNewWikiContent('');
      setIsCreateDialogOpen(false);
    }
    setCreatingWiki(false);
  };

  const handleDeleteWiki = async (wikiId: number) => {
    const success = await deleteWiki(wikiId);
    if (success) {
      setWikis(wikis.filter((wiki) => wiki.id !== wikiId));
    }
  };

  const openDeleteDialog = (wikiId: number) => {
    setWikiToDelete(wikiId);
    setDeleteDialogOpen(true);
  };

  const handleWikiCreatedFromDocument = (newWiki: Wiki) => {
    setWikis([newWiki, ...wikis]);
    setIsDocumentUploadOpen(false);
  };

  const navigateToWiki = (wikiId: number) => {
    // Create a simple navigation using the current wiki system
    // We'll implement a modal-based system for now
    setSelectedWiki(wikiId);
    setShowWikiDetail(true);
  };

  const [selectedWiki, setSelectedWiki] = useState<number | null>(null);
  const [showWikiDetail, setShowWikiDetail] = useState(false);
  const [showWikiEdit, setShowWikiEdit] = useState(false);
  const [showWikiHistory, setShowWikiHistory] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Wiki Pages</h1>
          <p className="text-muted-foreground">
            Share and collaborate on campus information
          </p>
        </div>

        <div className="flex space-x-2">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-1" />
                Create New Wiki
              </Button>
            </DialogTrigger>
          </Dialog>

          <Dialog
            open={isDocumentUploadOpen}
            onOpenChange={setIsDocumentUploadOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-1" />
                Upload Document
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Wiki</DialogTitle>
              <DialogDescription>
                Create a new wiki page to share useful information with other
                students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newWikiTitle}
                  onChange={(e) => setNewWikiTitle(e.target.value)}
                  placeholder="Enter wiki title"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  className="w-full min-h-[200px] p-3 border border-input rounded-md resize-vertical"
                  value={newWikiContent}
                  onChange={(e) => setNewWikiContent(e.target.value)}
                  placeholder="Enter wiki content"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setNewWikiTitle('');
                    setNewWikiContent('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateWiki}
                  disabled={
                    creatingWiki ||
                    !newWikiTitle.trim() ||
                    !newWikiContent.trim()
                  }
                >
                  {creatingWiki ? 'Creating...' : 'Create Wiki'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Document Upload Dialog */}
        <Dialog
          open={isDocumentUploadOpen}
          onOpenChange={setIsDocumentUploadOpen}
        >
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Document to Wiki</DialogTitle>
              <DialogDescription>
                Upload a PDF document to parse and create a wiki page
                automatically.
              </DialogDescription>
            </DialogHeader>
            <DocumentParser
              mode="wiki-upload"
              onWikiCreated={handleWikiCreatedFromDocument}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Wiki List */}
      {wikis.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No wiki pages yet</h3>
            <p className="text-muted-foreground mb-4">
              Create the first wiki page to share useful information!
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Wiki
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {wikis.map((wiki) => (
            <Card key={wiki.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">
                    <button
                      className="hover:text-primary transition-colors text-left"
                      onClick={() => navigateToWiki(wiki.id)}
                    >
                      {wiki.title}
                    </button>
                  </CardTitle>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedWiki(wiki.id);
                        setShowWikiHistory(true);
                      }}
                    >
                      <History className="w-4 h-4" />
                    </Button>
                    {/* 편집은 모든 사용자가 가능 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedWiki(wiki.id);
                        setShowWikiEdit(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {/* 삭제는 작성자만 가능 */}
                    {currentUser?.id === wiki.authorId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(wiki.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-3">
                  {wiki.content}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    <span>{wiki.author?.name || 'Author'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(wiki.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (wikiToDelete) {
            handleDeleteWiki(wikiToDelete);
            setWikiToDelete(null);
          }
        }}
        title="Delete Wiki?"
        description="This action cannot be undone. The wiki and all its edit history will be permanently deleted."
      />

      {/* Wiki Detail Modal */}
      {showWikiDetail && selectedWiki && (
        <WikiDetailModal
          wikiId={selectedWiki}
          onClose={() => setShowWikiDetail(false)}
          onEdit={() => {
            setShowWikiDetail(false);
            setShowWikiEdit(true);
          }}
          onHistory={() => {
            setShowWikiDetail(false);
            setShowWikiHistory(true);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Wiki Edit Modal */}
      {showWikiEdit && selectedWiki && (
        <WikiEditModal
          wikiId={selectedWiki}
          onClose={() => setShowWikiEdit(false)}
          onSave={(updatedWiki: Wiki) => {
            setWikis(
              wikis.map((w) => (w.id === updatedWiki.id ? updatedWiki : w)),
            );
            setShowWikiEdit(false);
          }}
        />
      )}

      {/* Wiki History Modal */}
      {showWikiHistory && selectedWiki && (
        <WikiHistoryModal
          wikiId={selectedWiki}
          onClose={() => setShowWikiHistory(false)}
        />
      )}
    </div>
  );
}

export default WikiIndexPage;
