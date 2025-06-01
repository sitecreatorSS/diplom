'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, User, Mail, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

type SellerApplication = {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string | null;
  createdAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
  };
  reviewer: {
    name: string | null;
    email: string;
  } | null;
};

type Stats = {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
};

export default function AdminSellerApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchApplications();
    }
  }, [status, router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/seller-applications');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при загрузке заявок');
      }
      
      setApplications(data.applications);
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError('Не удалось загрузить заявки. Пожалуйста, попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setUpdating(prev => ({ ...prev, [applicationId]: true }));
      setError('');

      const reviewNotes = prompt('Введите комментарий (необязательно):');
      
      const response = await fetch('/api/admin/seller-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status,
          reviewNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при обновлении статуса');
      }

      // Обновляем список заявок
      await fetchApplications();
      alert(`Заявка успешно ${status === 'APPROVED' ? 'одобрена' : 'отклонена'}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setUpdating(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysSinceRegistered = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredApplications = applications.filter(app => 
    app.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (app.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Панель администратора</h1>
            <p className="text-gray-600">Управление заявками продавцов</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push('/admin')}>
              Назад в админку
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Статистика */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold">{stats.totalUsers}</CardTitle>
                <CardDescription>Всего пользователей</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold">{stats.totalSellers}</CardTitle>
                <CardDescription>Продавцов</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-3xl font-bold">{stats.totalBuyers}</CardTitle>
                <CardDescription>Покупателей</CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Заявки на продавца</CardTitle>
                <CardDescription>
                  {applications.length} заявок, {applications.filter(a => a.status === 'PENDING').length} на рассмотрении
                </CardDescription>
              </div>
              <div className="w-64">
                <input
                  type="text"
                  placeholder="Поиск по email или имени..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Заявки не найдены' : 'Нет заявок на рассмотрении'}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <Card key={app.id} className="overflow-hidden">
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {app.user.name || 'Без имени'}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({app.user.role === 'ADMIN' ? 'Админ' : app.user.role === 'SELLER' ? 'Продавец' : 'Покупатель'})
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{app.user.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                              Зарегистрирован {getDaysSinceRegistered(app.user.createdAt)} дней назад
                            </span>
                          </div>
                          {app.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-sm font-medium text-gray-700">Сообщение от пользователя:</p>
                              <p className="text-sm text-gray-600 mt-1">{app.message}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            app.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status === 'PENDING' ? 'На рассмотрении' :
                             app.status === 'APPROVED' ? 'Одобрено' : 'Отклонено'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(app.createdAt)}
                          </div>
                          {app.reviewedAt && app.reviewer && (
                            <div className="text-xs text-gray-500 text-right">
                              {app.status === 'APPROVED' ? 'Одобрено' : 'Отклонено'} {formatDate(app.reviewedAt)}
                              <br />
                              {app.reviewer.name ? (
                                <span>модератором {app.reviewer.name}</span>
                              ) : (
                                <span>модератором {app.reviewer.email}</span>
                              )}
                            </div>
                          )}
                          {app.reviewNotes && (
                            <div className="mt-1 p-2 bg-gray-50 rounded-md text-xs text-gray-600 max-w-xs text-right">
                              <span className="font-medium">Комментарий: </span>
                              {app.reviewNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      {app.status === 'PENDING' && (
                        <div className="mt-4 flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                            disabled={updating[app.id]}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                          >
                            {updating[app.id] ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <X className="h-4 w-4 mr-2" />
                            )}
                            Отклонить
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                            disabled={updating[app.id]}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {updating[app.id] ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4 mr-2" />
                            )}
                            Одобрить
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
