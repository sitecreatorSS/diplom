'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  sellerApplication: {
    id: string;
    status: string;
    message: string | null;
    createdAt: string;
    reviewedAt: string | null;
    reviewNotes: string | null;
  } | null;
  _count: {
    orders: number;
    products: number;
  };
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при загрузке профиля');
      }
      
      setProfile(data);
      
      // Если у пользователя есть заявка, показываем её сообщение
      if (data.sellerApplication?.message) {
        setApplicationMessage(data.sellerApplication.message);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAsSeller = async () => {
    if (!applicationMessage.trim()) {
      alert('Пожалуйста, укажите сообщение для заявки');
      return;
    }

    try {
      setApplying(true);
      const response = await fetch('/api/seller-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: applicationMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при отправке заявки');
      }

      // Обновляем профиль после успешной отправки заявки
      await fetchProfile();
      alert('Заявка успешно отправлена на рассмотрение');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при отправке заявки');
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysSinceRegistered = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Произошла ошибка при загрузке профиля</h1>
      </div>
    );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Мой профиль</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader>
              <CardTitle className="text-primary">Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Имя</p>
                <p className="font-medium text-foreground">{profile.name || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Роль</p>
                <p className="font-medium text-foreground capitalize">
                  {profile.role === 'ADMIN' ? 'Администратор' : 
                   profile.role === 'SELLER' ? 'Продавец' : 'Покупатель'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Дата регистрации</p>
                <p className="font-medium text-foreground">
                  {formatDate(profile.createdAt)} ({getDaysSinceRegistered(profile.createdAt)} дней назад)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader>
              <CardTitle className="text-primary">Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Всего заказов</p>
                <p className="text-2xl font-bold text-primary">{profile._count.orders}</p>
              </div>
              
              {profile.role === 'SELLER' && (
                <div>
                  <p className="text-sm text-muted-foreground">Товаров в продаже</p>
                  <p className="text-2xl font-bold text-primary">{profile._count.products}</p>
                </div>
              )}
              
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">Статус аккаунта</p>
                {profile.role === 'SELLER' ? (
                  <div className="mt-2 p-3 bg-green-50 text-primary rounded-md border border-green-100">
                    <p className="font-medium">Вы продавец</p>
                    <p className="text-sm mt-1">Теперь вы можете добавлять и продавать товары</p>
                  </div>
                ) : profile.sellerApplication ? (
                  <div className={`mt-2 p-3 ${
                    profile.sellerApplication.status === 'PENDING' 
                      ? 'bg-yellow-50 text-primary border border-yellow-100 rounded-md' 
                      : 'bg-red-50 text-destructive border border-red-100 rounded-md'
                  }`}>
                    <p className="font-medium">
                      {profile.sellerApplication.status === 'PENDING' 
                        ? 'Заявка на рассмотрении' 
                        : 'Заявка отклонена'}
                    </p>
                    {profile.sellerApplication.reviewNotes && (
                      <p className="text-sm mt-1">
                        <span className="font-medium">Комментарий: </span>
                        {profile.sellerApplication.reviewNotes}
                      </p>
                    )}
                    {profile.sellerApplication.status === 'REJECTED' && (
                      <Button 
                        variant="default" 
                        className="mt-2"
                        onClick={() => {
                          setApplicationMessage(profile.sellerApplication?.message || '');
                          document.getElementById('seller-application')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        Подать заново
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                    <p className="font-medium">Вы покупатель</p>
                    <p className="text-sm mt-1">Хотите стать продавцом? Отправьте заявку ниже.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {(profile.role === 'BUYER' && (!profile.sellerApplication || profile.sellerApplication.status === 'REJECTED')) && (
          <Card id="seller-application" className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
            <CardHeader>
              <CardTitle className="text-primary">Стать продавцом</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                    Почему вы хотите стать продавцом?
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Опишите, почему вы хотите стать продавцом и что планируете продавать..."
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    disabled={applying}
                  />
                </div>
                <Button
                  onClick={handleApplyAsSeller}
                  disabled={applying}
                  variant="default"
                >
                  {applying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    'Отправить заявку'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
