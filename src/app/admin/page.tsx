'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';

type Stats = {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalProducts: number;
  pendingApplications: number;
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке статистики');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Панель администратора</h1>
            <p className="text-gray-800">Обзор системы и управление</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-indigo-700">{stats?.totalUsers || 0}</CardTitle>
              <CardDescription className="text-indigo-700 !opacity-100">Всего пользователей</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-900">
                <Users className="h-4 w-4 mr-2 text-indigo-600" />
                <span>{stats?.totalBuyers || 0} покупателей, {stats?.totalSellers || 0} продавцов</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-indigo-700">{stats?.totalProducts || 0}</CardTitle>
              <CardDescription className="text-indigo-700 !opacity-100">Товаров в каталоге</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-900">
                <Package className="h-4 w-4 mr-2 text-indigo-600" />
                <span>Доступно для заказа</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold text-indigo-700">{stats?.pendingApplications || 0}</CardTitle>
              <CardDescription className="text-indigo-700 !opacity-100">Заявок на продавца</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-900">
                <FileText className="h-4 w-4 mr-2 text-indigo-600" />
                <span>Требуют рассмотрения</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-indigo-700">Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/admin/seller-applications">
                  <Button variant="default" className="w-full justify-between">
                    <span>Заявки продавцов</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button variant="default" className="w-full justify-between">
                    <span>Управление пользователями</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/admin/products">
                  <Button variant="default" className="w-full justify-between">
                    <span>Управление товарами</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Разделы админки */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-700">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                Пользователи
              </CardTitle>
              <CardDescription className="text-indigo-700 !opacity-100">
                Управление пользователями и их ролями
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  Всего зарегистрировано: <span className="font-medium text-indigo-700">{stats?.totalUsers || 0}</span>
                </p>
                <p className="text-sm text-gray-900">
                  Продавцов: <span className="font-medium text-indigo-700">{stats?.totalSellers || 0}</span>
                </p>
                <p className="text-sm text-gray-900">
                  Покупателей: <span className="font-medium text-indigo-700">{stats?.totalBuyers || 0}</span>
                </p>
                <div className="pt-2">
                  <Link href="/admin/users">
                    <Button variant="default" size="sm" className="mt-2">
                      Управление пользователями
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader>
              <CardTitle className="flex items-center text-indigo-700">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Заявки на продавца
              </CardTitle>
              <CardDescription className="text-indigo-700 !opacity-100">
                Рассмотрение заявок на получение статуса продавца
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-900">
                  Ожидают рассмотрения: <span className="font-medium text-indigo-700">{stats?.pendingApplications || 0}</span>
                </p>
                <p className={`text-sm ${stats?.pendingApplications === 0 ? 'text-gray-900' : 'text-indigo-700'}`}>
                  {stats?.pendingApplications === 0
                    ? 'Нет новых заявок на рассмотрение'
                    : 'Есть заявки, требующие вашего внимания'}
                </p>
                <div className="pt-2">
                  <Link href="/admin/seller-applications">
                    <Button variant="default" size="sm" className="mt-2">
                      {stats?.pendingApplications === 0 ? 'Просмотреть все' : 'Проверить заявки'}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}