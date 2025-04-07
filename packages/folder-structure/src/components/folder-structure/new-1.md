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
  width: 100%;
  box-sizing: border-box;
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

const FileContent = styled.div`
  display: flex;
  align-items: center;
  margin-left: ${props => props.level * 20}px;
  width: 100%;
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
      onClick={() => dispatch(toggleSelectItem(file.id))}
    >
      <FileContent level={level}>
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
      </FileContent>
    </FileContainer>
  );
};

/// folder-structure
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
        <ListContainer style={{ height: `${height}px`, overflowY: 'auto' }}>
          {data?.items.map((item) => (
            <FolderItem key={item.id} item={item} level={0} />
          ))}
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

//folder
import React, { Suspense, useEffect, useState } from 'react';
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
  position: relative;
  width: 100%;
`;

const FolderIcon = styled.span`
  margin-right: 8px;
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const ItemList = styled.div`
  width: 100%;
`;

const ItemContainer = styled.div`
  width: 100%;
  margin-top: 4px;
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
  
  // Track if folder is mounted and fully rendered
  const [folderHeight, setFolderHeight] = useState<number>(0);
  
  const isOpen = openFolders.includes(folder.id);
  const isSelected = selectedItems.includes(folder.id);
  
  // Fetch content only when folder is open
  const { data, isLoading } = useQuery({
    queryKey: ['folderContents', folder.id, currentPage],
    queryFn: () => fetchFolderContents(folder.id, currentPage, itemsPerPage),
    enabled: isOpen, // Only fetch when folder is open
  });
  
  // Update height after data loads
  useEffect(() => {
    if (isOpen && data && !isLoading) {
      // Approximate height calculation
      const newHeight = data.items.length * 40;
      setFolderHeight(newHeight);
    } else {
      setFolderHeight(0);
    }
  }, [isOpen, data, isLoading]);
  
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
  
  return (
    <>
      <FolderContainer isSelected={isSelected}>
        <Checkbox 
          type="checkbox" 
          checked={isSelected}
          onChange={handleSelectFolder}
          onClick={e => e.stopPropagation()}
        />
        <div onClick={handleToggleFolder} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
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
              <ItemList style={{ minHeight: folderHeight }}>
                {data.items.map((item, index) => (
                  <ItemContainer key={item.id}>
                    <FolderItem item={item} level={level + 1} />
                  </ItemContainer>
                ))}
              </ItemList>
            ) : (
              <div style={{ padding: '10px 0' }}>This folder is empty</div>
            )}
          </Suspense>
        </FolderChildren>
      )}
    </>
  );
};