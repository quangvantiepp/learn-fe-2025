

```tsx

// src/components/FolderStructure/FolderStructure.tsx
import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { fetchFolderContents } from '../../services/api';
import { FolderItem } from './FolderItem';
import { Pagination } from './Pagination';
import { RootState } from '../../store';

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
`;

const ListContainer = styled.div`
  width: 100%;
  overflow-y: auto;
`;

const FolderContentContainer = styled.div`
  width: 100%;
`;

interface FolderStructureProps {
  rootFolderId: string;
  height: number;
}

export const FolderStructure: React.FC<FolderStructureProps> = ({
  rootFolderId,
  height,
}) => {
  const dispatch = useDispatch();
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.folder
  );

  // Fetch content of the root folder
  const { data, isLoading } = useQuery({
    queryKey: ['folderContents', rootFolderId, currentPage],
    queryFn: () => fetchFolderContents(rootFolderId, currentPage, itemsPerPage),
  });

  if (isLoading) {
    return <Skeleton count={5} height={50} />;
  }

  return (
    <Container>
      <Suspense fallback={<Skeleton count={5} height={50} />}>
        <ListContainer style={{ height: `${height}px` }}>
          <FolderContentContainer>
            {data?.items?.map(item => (
              <FolderItem key={item.id} item={item} level={0} />
            ))}
            {data?.items?.length === 0 && (
              <div style={{ padding: '10px' }}>No items found</div>
            )}
          </FolderContentContainer>
        </ListContainer>
        <Pagination
          currentPage={currentPage}
          totalPages={data?.totalPages || 1}
          previousPages={2}
          nextPages={2}
        />
      </Suspense>
    </Container>
  );
};

// src/hooks/useVirtualization.ts

import { useState, useEffect } from 'react';
import { CellMeasurerCache } from 'react-virtualized';

export function useVirtualization() {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  
  // Tạo cache cho CellMeasurer
  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 50,
  });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      cache.clearAll();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    windowHeight,
    cache,
  };
}


// src/components/FolderStructure/Folder.tsx
import React, { Suspense, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import Skeleton from 'react-loading-skeleton';
import { 
  toggleFolder, 
  toggleSelectItem, 
  selectAllInFolder,
  unselectAllInFolder
} from '../../store/slices/folderSlice';
import { RootState } from '../../store';
import { fetchFolderContents } from '../../services/api';
import { FolderItem } from './FolderItem';
import { FolderType, FolderItemType } from '../../types';

const FolderContainer = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: ${props => props.isSelected ? '#e6f7ff' : 'transparent'};
  cursor: pointer;
`;

const FolderChildren = styled.div`
  margin-left: 20px;
`;

const FolderIcon = styled.span`
  margin-right: 8px;
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

interface FolderProps {
  folder: FolderType;
  level: number;
}

export const Folder: React.FC<FolderProps> = ({ folder, level }) => {
  const dispatch = useDispatch();
  const { openFolders, selectedItems, currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.folder
  );
  
  const isOpen = openFolders.includes(folder.id);
  const isSelected = selectedItems.includes(folder.id);
  
  // State to manage the transition between loading and showing content
  const [renderKey, setRenderKey] = useState(`folder-${folder.id}-${Date.now()}`);
  const [showSkeleton, setShowSkeleton] = useState(true);
  
  // Fetch content only when folder is open
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['folderContents', folder.id, currentPage],
    queryFn: () => fetchFolderContents(folder.id, currentPage, itemsPerPage),
    enabled: isOpen,
  });
  
  // Handle folder open/close and loading states
  useEffect(() => {
    if (!isOpen) {
      setShowSkeleton(true);
    } else if (isOpen && !isLoading && !isFetching && data) {
      // Use a timeout to ensure we don't have both loading and content showing at once
      const timer = setTimeout(() => {
        setShowSkeleton(false);
        // Generate a new render key to force remount of child components
        setRenderKey(`folder-${folder.id}-${Date.now()}`);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading, isFetching, data, folder.id]);
  
  // Reset skeleton state when folder is toggled
  useEffect(() => {
    if (isOpen) {
      setShowSkeleton(true); 
    }
  }, [isOpen]);
  
  const handleToggleFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFolder(folder.id));
  };
  
  const handleSelectFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    dispatch(toggleSelectItem(folder.id));
    
    if (data && e.target.checked) {
      const childIds = data.items.map(item => item.id);
      dispatch(selectAllInFolder(childIds));
    } 
    else if (data && !e.target.checked) {
      const childIds = data.items.map(item => item.id);
      dispatch(unselectAllInFolder(childIds));
    }
  };
  
  return (
    <>
      <FolderContainer isSelected={isSelected}>
        <Checkbox 
          type="checkbox" 
          checked={isSelected}
          onChange={handleSelectFolder}
          onClick={e => e.stopPropagation()}
        />
        <div onClick={handleToggleFolder} style={{ display: 'flex', alignItems: 'center' }}>
          <FolderIcon>{isOpen ? '📂' : '📁'}</FolderIcon>
          <span>{folder.name}</span>
        </div>
      </FolderContainer>
      
      {isOpen && (
        <FolderChildren>
          {showSkeleton || isLoading || isFetching ? (
            <Skeleton count={3} height={30} />
          ) : data?.items && data.items.length > 0 ? (
            <div key={renderKey}>
              {data.items.map((item: FolderItemType) => (
                <FolderItem key={item.id} item={item} level={level + 1} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '10px 0' }}>This folder is empty</div>
          )}
        </FolderChildren>
      )}
    </>
  );
};

// src/hooks/useRedux.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';

// Sử dụng hooks này thay cho standard hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import folderReducer from './slices/folderSlice';

export const store = configureStore({
  reducer: {
    folder: folderReducer,
  },
});

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// src/components/FolderStructure/FolderItem.tsx
import React from "react";
import { File } from "./file";
import { Folder } from "./folder";
import { FolderItemType } from "../../types";

interface FolderItemProps {
  item: FolderItemType;
  level: number;
}

export const FolderItem: React.FC<FolderItemProps> = ({ item, level }) => {
  if (item.type === "folder") {
    return <Folder folder={item} level={level} />;
  } else {
    return <File file={item} level={level} />;
  }
};



// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { store } from './store';

// Khởi động MSW trong môi trường development
if (process.env.NODE_ENV === 'development') {
  const { worker } = require('./mocks/browser');
  worker.start();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);

// src/App.tsx
import React from 'react';
import { FolderStructure } from './components/FolderStructure/FolderStructure';
import styled from '@emotion/styled';

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const App: React.FC = () => {
  return (
    <AppContainer>
      <h1>Folder Structure</h1>
      <FolderStructure 
        rootFolderId="root" 
        height={600} 
      />
    </AppContainer>
  );
};

export default App;
```

