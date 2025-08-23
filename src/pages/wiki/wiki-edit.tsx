import { useEffect, useState } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUser } from '@/data/get-user';
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 편집 상태
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editComment, setEditComment] = useState('');

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
      comment: editComment || '내용 수정',
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
        <h2 className="text-xl font-semibold mb-2">위키를 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-4">
          요청하신 위키가 존재하지 않거나 삭제되었습니다.
        </p>
        <Button onClick={() => navigate({ to: '/wiki' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          위키 목록으로 돌아가기
        </Button>
      </div>
    );
  }

  if (currentUser?.id !== wiki.authorId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">편집 권한이 없습니다</h2>
        <p className="text-muted-foreground mb-4">
          이 위키는 작성자만 편집할 수 있습니다.
        </p>
        <Button
          onClick={() =>
            navigate({
              to: '/wiki/$wikiId',
              params: { wikiId: wiki.id.toString() },
            })
          }
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          위키로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
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
          위키로 돌아가기
        </Button>

        <Button
          onClick={handleSave}
          disabled={
            saving || !hasChanges() || !editTitle.trim() || !editContent.trim()
          }
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '저장 중...' : '저장하기'}
        </Button>
      </div>

      {/* 편집 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>위키 편집</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 제목 */}
          <div>
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="위키 제목을 입력하세요"
            />
          </div>

          {/* 내용 */}
          <div>
            <Label htmlFor="content">내용</Label>
            <textarea
              id="content"
              className="w-full min-h-[400px] p-3 border border-input rounded-md resize-vertical font-mono"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="위키 내용을 입력하세요"
            />
          </div>

          {/* 편집 코멘트 */}
          <div>
            <Label htmlFor="comment">편집 코멘트 (선택사항)</Label>
            <Input
              id="comment"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="이번 편집에 대한 간단한 설명을 입력하세요"
            />
          </div>

          {/* 저장 버튼 */}
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
              취소
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
              {saving ? '저장 중...' : '저장하기'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WikiEditPage;
