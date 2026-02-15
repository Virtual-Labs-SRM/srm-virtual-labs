import { useLocation, Link } from 'react-router-dom';
import { ChevronDown, Home, BookOpen } from 'lucide-react';
import { MODULES } from '@/data/modules';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DynamicIcon } from '@/components/ui/dynamic-icon';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const isModuleActive = (moduleId: string) => {
    return location.pathname === `/module/${moduleId}` || location.pathname.startsWith(`/module/${moduleId}/`);
  };

  const isSubModuleActive = (moduleId: string, subModuleId: string) => {
    return location.pathname === `/module/${moduleId}/${subModuleId}`;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarHeader className="border-b border-border p-2">
        <Link to="/" className="flex items-center gap-2 group px-1">
          <img
            src="/logo.png"
            alt="SRM Logo"
            className="h-12 w-12 shrink-0 object-contain group-hover:scale-110 transition-transform duration-200"
          />
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-blue-800 tracking-tight">SRM</span>
              <span className="text-[10px] text-foreground font-bold -mt-0.5">
                Virtual Labs
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={location.pathname === '/'}
                className={cn(
                  "transition-all duration-200 group/home",
                  location.pathname === '/'
                    ? "bg-purple-600 text-white font-semibold hover:bg-purple-700 hover:text-white"
                    : "text-foreground hover:bg-purple-600 hover:text-white"
                )}
              >
                <Link to="/">
                  <Home className={cn(
                    "h-4 w-4 transition-colors",
                    location.pathname === '/' ? "text-white" : "text-black group-hover/home:text-white"
                  )} />
                  <span className="font-medium">Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MODULES.map((module) => {
                // Check if module has only one submodule
                const isSingle = module.subModules.length === 1;
                const singleSubModule = module.subModules[0];
                const active = isModuleActive(module.id);

                if (isSingle) {
                  return (
                    <SidebarMenuItem key={module.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cn(
                          "transition-all duration-200 group/item relative",
                          active
                            ? "bg-purple-600 text-white font-semibold hover:bg-purple-700 hover:text-white"
                            : "text-foreground hover:bg-purple-600 hover:text-white"
                        )}
                      >
                        <Link to={`/module/${module.id}/${singleSubModule.id}`}>
                          <DynamicIcon
                            name={module.icon}
                            className={cn(
                              "h-4 w-4 transition-colors",
                              active ? "text-white" : "text-black group-hover/item:text-white"
                            )}
                          />
                          <span className="flex-1 truncate">{module.number}. {module.title}</span>
                          {!singleSubModule.implemented && (
                            <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 min-w-[3rem] justify-center bg-background/50 text-current border-current opacity-70">
                              Soon
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={module.id}
                    defaultOpen={active}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={cn(
                            "w-full transition-all duration-200 group/item",
                            active
                              ? "text-purple-700 font-medium hover:bg-purple-600 hover:text-white"
                              : "text-foreground hover:bg-purple-600 hover:text-white"
                          )}
                        >
                          <DynamicIcon
                            name={module.icon}
                            className={cn(
                              "h-4 w-4 transition-colors",
                              active ? "text-purple-700 group-hover/item:text-white" : "text-black group-hover/item:text-white"
                            )}
                          />
                          <span className="flex-1 truncate">{module.number}. {module.title}</span>
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180 opacity-50 group-hover/item:text-white" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {module.subModules.map((subModule) => {
                            const subActive = isSubModuleActive(module.id, subModule.id);
                            return (
                              <SidebarMenuSubItem key={subModule.id}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={subActive}
                                  className={cn(
                                    "transition-all duration-200 group/sub",
                                    subActive
                                      ? "bg-purple-600 text-white font-medium hover:bg-purple-700 hover:text-white"
                                      : "text-muted-foreground hover:bg-purple-600 hover:text-white"
                                  )}
                                >
                                  <Link to={`/module/${module.id}/${subModule.id}`}>
                                    <DynamicIcon
                                      name={subModule.icon}
                                      className={cn(
                                        "h-3 w-3 mr-2 transition-colors",
                                        subActive ? "text-white" : "text-foreground group-hover/sub:text-white"
                                      )}
                                    />
                                    <span className="truncate">{subModule.title}</span>
                                    {!subModule.implemented && (
                                      <Badge variant="outline" className="ml-auto text-[10px] px-1 py-0 h-4 text-current border-current opacity-70">
                                        Soon
                                      </Badge>
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4 bg-muted/5">
        {!collapsed && (
          <div className="flex flex-col items-center gap-1">
            <p className="text-xs font-medium text-foreground">
              © 2026 SRM AI Virtual Lab
            </p>
            <p className="text-[10px] text-muted-foreground">
              Department of Computational Intelligence
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
