// src/components/FolderStructure/Folder.tsx
import React, { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import {
  toggleFolder,
  toggleSelectItem,
  selectAllInFolder,
  unselectAllInFolder,
} from "../../store/slices/folder-slice";
import { RootState } from "../../store";
import { fetchFolderContents } from "../../services/api";
import { FolderItem } from "./folder-item";
import { FolderType } from "../../types";

const FolderContainer = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: ${(props) =>
    props.isSelected ? "#e6f7ff" : "transparent"};
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

  // Cache for dynamic height measurements
  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 50,
  });

  // Fetch content only when folder is open
  const { data, isLoading } = useQuery({
    queryKey: ["folderContents", folder.id, currentPage],
    queryFn: () => fetchFolderContents(folder.id, currentPage, itemsPerPage),
    enabled: isOpen, // Only fetch when folder is open
  });

  const handleToggleFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleFolder(folder.id));
  };

  const handleSelectFolder = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    dispatch(toggleSelectItem(folder.id));

    // If we have data and the folder is checked, select all children
    if (data && e.target.checked) {
      const childIds = data.items.map((item) => item.id);
      dispatch(selectAllInFolder(childIds));
    }
    // If we have data and the folder is unchecked, unselect all children
    else if (data && !e.target.checked) {
      const childIds = data.items.map((item) => item.id);
      dispatch(unselectAllInFolder(childIds));
    }
  };

  const rowRenderer = ({ index, key, parent, style }: RowRendererProps) => {
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({ measure, registerChild }) => (
          <div style={style} ref={registerChild as any} onLoad={measure}>
            <FolderItem
              item={data?.items[index] as FolderType}
              level={level + 1}
            />
          </div>
        )}
      </CellMeasurer>
    );
  };

  return (
    <>
      <FolderContainer isSelected={isSelected}>
        <Checkbox
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectFolder}
          onClick={(e) => e.stopPropagation()}
        />
        <div
          onClick={handleToggleFolder}
          style={{ display: "flex", alignItems: "center" }}
        >
          <FolderIcon>{isOpen ? "📂" : "📁"}</FolderIcon>
          <span>{folder.name}</span>
        </div>
      </FolderContainer>

      {isOpen && (
        <FolderChildren>
          <Suspense fallback={<Skeleton count={3} height={30} />}>
            {isLoading ? (
              <Skeleton count={3} height={30} />
            ) : (
              <div
                style={{
                  height: Math.min(300, (data?.items.length || 1) * 50),
                }}
              >
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      width={width}
                      height={Math.min(300, (data?.items.length || 1) * 50)}
                      deferredMeasurementCache={cache}
                      rowCount={data?.items.length || 0}
                      rowHeight={cache.rowHeight}
                      rowRenderer={rowRenderer}
                      overscanRowCount={3}
                    />
                  )}
                </AutoSizer>
              </div>
            )}
          </Suspense>
        </FolderChildren>
      )}
    </>
  );
};
