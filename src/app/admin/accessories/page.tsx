import { getAllAccessories } from '@/lib/firebase-data-server';
import ManageAccessoriesClient from './ManageAccessoriesClient';

// A página principal é um Server Component, ideal para buscar dados.
export default async function ManageAccessoriesPage() {
  // 1. Busca os dados no servidor
  const accessories = await getAllAccessories();

  // 2. Passa os dados para o componente de cliente que cuidará da lógica de UI
  return <ManageAccessoriesClient initialAccessories={accessories} />;
}