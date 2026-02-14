import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface ModuleBreadcrumbsProps {
  moduleTitle?: string;
  moduleId?: string;
  subModuleTitle?: string;
}

export function ModuleBreadcrumbs({ moduleTitle, moduleId, subModuleTitle }: ModuleBreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {moduleTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {subModuleTitle ? (
                <BreadcrumbLink asChild>
                  <Link to={`/module/${moduleId}`}>{moduleTitle}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{moduleTitle}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}
        {subModuleTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{subModuleTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
