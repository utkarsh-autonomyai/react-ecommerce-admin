import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { CategoryForm } from '@/features/categories/components/category-form';

export const Route = createFileRoute('/_authenticated/categories/create')({
  component: CategoryCreatePage,
});

function CategoryCreatePage() {
  useDocumentTitle('Create Category');
  return (
    <div className='space-y-6'>
      <PageHeader
        title='Create Category'
        description='Add a new product category'
      >
        <Button variant='outline' asChild>
          <Link to='/categories'>
            <ArrowLeft size={16} />
            Back to categories
          </Link>
        </Button>
      </PageHeader>

      <div className='max-w-2xl'>
        <CategoryForm />
      </div>
    </div>
  );
}
