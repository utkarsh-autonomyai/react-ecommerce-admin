import type { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

const PageHeader = ({ title, description, children }: PageHeaderProps) => {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
          {title}
        </h1>
        {description && <p className='text-muted-foreground'>{description}</p>}
      </div>
      {children && <div className='flex items-center gap-2'>{children}</div>}
    </div>
  );
};

export { PageHeader };
