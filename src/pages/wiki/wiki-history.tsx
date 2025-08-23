import { useEffect, useState } from 'react';

import { useNavigate, useParams } from '@tanstack/react-router';
import { ArrowLeft, Calendar, MessageCircle, User } from 'lucide-react';

import { MarkdownRenderer } from '@/components/markdown-renderer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type Wiki,
  type WikiHistory,
  getWikiById,
  getWikiHistory,
} from '@/data/wiki';

function WikiHistoryPage() {
  const { wikiId } = useParams({ from: '/wiki/$wikiId/history' });
  const navigate = useNavigate();
  const [wiki, setWiki] = useState<Wiki | null>(null);
  const [history, setHistory] = useState<WikiHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!wikiId) return;

      try {
        const [wikiData, historyData] = await Promise.all([
          getWikiById(parseInt(wikiId)),
          getWikiHistory(parseInt(wikiId)),
        ]);
        setWiki(wikiData);
        setHistory(historyData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [wikiId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
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
          <h1 className="text-2xl font-bold mt-2">
            {wiki.title} - 편집 히스토리
          </h1>
        </div>
      </div>

      {/* 히스토리 목록 */}
      {history.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              편집 히스토리가 없습니다
            </h3>
            <p className="text-muted-foreground">
              이 위키의 편집 기록을 불러올 수 없습니다.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((entry, index) => (
            <Card key={entry.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {index === 0
                      ? '최신 버전'
                      : `버전 ${history.length - index}`}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>
                        {entry.editor.name} (@{entry.editor.nickname})
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(entry.editedAt)}</span>
                    </div>
                  </div>
                </div>
                {entry.comment && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span>{entry.comment}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-md p-4">
                  <div className="max-h-40 overflow-y-auto">
                    <MarkdownRenderer
                      content={entry.content}
                      className="prose-sm"
                    />
                  </div>
                </div>
              </CardContent>
              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    현재 버전
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default WikiHistoryPage;
