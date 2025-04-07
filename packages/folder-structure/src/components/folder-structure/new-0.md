// types
// src/types.ts
export interface FileType {
  id: string;
  name: string;
  type: 'file';
  isLabeled: boolean; // Track if file is labeled
}

export interface FolderType {
  id: string;
  name: string;
  type: 'folder';
}

export type FolderItemType = FileType | FolderType;

export interface FolderContentsResponse {
  items: FolderItemType[];
  totalPages: number;
  currentPage: number;
}

// folder structure
import React, { Suspense, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
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
  const { openFolders, selectedItems, currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.folder
  );

  // Create a cache for dynamic row heights with key to ensure proper memoization
  const cache = useMemo(() => new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 50,
  }), [rootFolderId, currentPage]); // Recreate cache when root folder or page changes

  // Fetch content of the root folder
  const { data, isLoading } = useQuery({
    queryKey: ['folderContents', rootFolderId, currentPage],
    queryFn: () => fetchFolderContents(rootFolderId, currentPage, itemsPerPage),
  });

  if (isLoading) {
    return <Skeleton count={5} height={50} />;
  }

  const rowRenderer = ({ index, key, parent, style }) => {
    const item = data?.items[index];
    if (!item) return null;
    
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({ measure, registerChild }) => (
          <div 
            style={{
              ...style,
              width: '100%',
              boxSizing: 'border-box'
            }} 
            ref={registerChild} 
            onLoad={measure}
          >
            <FolderItem 
              item={item} 
              level={0} 
            />
          </div>
        )}
      </CellMeasurer>
    );
  };

  return (
    <Container>
      <Suspense fallback={<Skeleton count={5} height={50} />}>
        <ListContainer style={{ height: `${height}px` }}>
          <AutoSizer>
            {({ width, height: autoHeight }) => (
              <List
                width={width}
                height={autoHeight}
                deferredMeasurementCache={cache}
                rowCount={data?.items?.length || 0}
                rowHeight={cache.rowHeight}
                rowRenderer={rowRenderer}
                overscanRowCount={5}
                // Key to force remount when page changes
                key={`root-list-${rootFolderId}-${currentPage}`}
              />
            )}
          </AutoSizer>
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

// file component
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { toggleSelectItem } from '../../store/slices/folderSlice';
import { RootState } from '../../store';
import { FileType } from '../../types';

const FileContainer = styled.div<{ isSelected: boolean; isLabeled: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: ${props => props.isSelected ? '#e6f7ff' : 'transparent'};
  cursor: pointer;
  margin-left: ${props => props.level * 20}px;
`;

const FileIcon = styled.span`
  margin-right: 8px;
`;

const FileName = styled.span<{ isLabeled: boolean }>`
  color: ${props => props.isLabeled ? 'green' : 'red'};
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

interface FileProps {
  file: FileType;
  level: number;
}

export const File: React.FC<FileProps> = ({ file, level }) => {
  const dispatch = useDispatch();
  const { selectedItems } = useSelector((state: RootState) => state.folder);
  
  const isSelected = selectedItems.includes(file.id);
  
  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    dispatch(toggleSelectItem(file.id));
  };
  
  return (
    <FileContainer 
      isSelected={isSelected} 
      isLabeled={file.isLabeled} 
      level={level}
      onClick={() => dispatch(toggleSelectItem(file.id))}
    >
      <Checkbox 
        type="checkbox" 
        checked={isSelected}
        onChange={handleSelectFile}
        onClick={e => e.stopPropagation()}
      />
      <FileIcon>📄</FileIcon>
      <FileName isLabeled={file.isLabeled}>
        {file.name} {file.isLabeled ? '(labeled)' : '(unlabeled)'}
      </FileName>
    </FileContainer>
  );
};

/// folder component
import React, { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { List, AutoSizer, CellMeasurer, CellMeasurerCache } from 'react-virtualized';
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
import { FolderType } from '../../types';

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

// Interface for rowRenderer
interface RowRendererProps {
  index: number;
  key: string;
  parent: any;
  style: React.CSSProperties;
}

export const Folder: React.FC<FolderProps> = ({ folder, level }) => {
  const dispatch = useDispatch();
  const { openFolders, selectedItems, currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.folder
  );
  
  const isOpen = openFolders.includes(folder.id);
  const isSelected = selectedItems.includes(folder.id);
  
  // Create cache outside useEffect to maintain reference
  const cache = React.useMemo(() => new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 50,
  }), [folder.id]); // Recreate cache when folder changes
  
  // Fetch content only when folder is open
  const { data, isLoading } = useQuery({
    queryKey: ['folderContents', folder.id, currentPage],
    queryFn: () => fetchFolderContents(folder.id, currentPage, itemsPerPage),
    enabled: isOpen, // Only fetch when folder is open
  });
  
  // Clear cache when data changes or when folder opens/closes
  useEffect(() => {
    if (isOpen) {
      // Reset cache when folder opens or data changes
      cache.clearAll();
    }
  }, [isOpen, data, cache]);
  
  const handleToggleFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFolder(folder.id));
  };
  
  const handleSelectFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    dispatch(toggleSelectItem(folder.id));
    
    // If we have data and the folder is checked, select all children
    if (data && e.target.checked) {
      const childIds = data.items.map(item => item.id);
      dispatch(selectAllInFolder(childIds));
    } 
    // If we have data and the folder is unchecked, unselect all children
    else if (data && !e.target.checked) {
      const childIds = data.items.map(item => item.id);
      dispatch(unselectAllInFolder(childIds));
    }
  };
  
  const rowRenderer = ({ index, key, parent, style }: RowRendererProps) => {
    const item = data?.items[index];
    
    if (!item) return null;
    
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({ measure, registerChild }) => (
          <div 
            style={{
              ...style,
              width: '100%', // Ensure full width
              boxSizing: 'border-box'
            }} 
            ref={registerChild as any}
            onLoad={measure}
          >
            <FolderItem 
              item={item}
              level={level + 1}
            />
          </div>
        )}
      </CellMeasurer>
    );
  };
  
  // Calculate a more accurate height for the list container
  const listHeight = React.useMemo(() => {
    if (!data?.items.length) return 0;
    return Math.min(300, data.items.length * 50);
  }, [data?.items.length]);
  
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
          <Suspense fallback={<Skeleton count={3} height={30} />}>
            {isLoading ? (
              <Skeleton count={3} height={30} />
            ) : data?.items.length ? (
              <div style={{ height: listHeight, width: '100%' }}>
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      width={width}
                      height={listHeight}
                      deferredMeasurementCache={cache}
                      rowCount={data.items.length}
                      rowHeight={cache.rowHeight}
                      rowRenderer={rowRenderer}
                      overscanRowCount={3}
                      // Force recompute all row heights when the list changes
                      scrollToIndex={0}
                      // Add key to force remount when folder changes
                      key={`folder-list-${folder.id}-${isOpen}`}
                    />
                  )}
                </AutoSizer>
              </div>
            ) : (
              <div style={{ padding: '10px 0' }}>This folder is empty</div>
            )}
          </Suspense>
        </FolderChildren>
      )}
    </>
  );
};

