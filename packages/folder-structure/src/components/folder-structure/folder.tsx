import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { FolderType, FolderItemType } from "../../types";

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

export const Folder: React.FC<FolderProps> = ({ folder, level }) => {
  const dispatch = useDispatch();
  const { openFolders, selectedItems, currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.folder
  );

  const isOpen = openFolders.includes(folder.id);
  const isSelected = selectedItems.includes(folder.id);

  // State to manage the transition between loading and showing content
  const [renderKey, setRenderKey] = useState(
    `folder-${folder.id}-${Date.now()}`
  );
  const [showSkeleton, setShowSkeleton] = useState(true);

  // Fetch content only when folder is open
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["folderContents", folder.id, currentPage],
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
      const childIds = data.items.map((item) => item.id);
      dispatch(selectAllInFolder(childIds));
    } else if (data && !e.target.checked) {
      const childIds = data.items.map((item) => item.id);
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
          {showSkeleton || isLoading || isFetching ? (
            <Skeleton count={3} height={30} />
          ) : data?.items && data.items.length > 0 ? (
            <div key={renderKey}>
              {data.items.map((item: FolderItemType) => (
                <FolderItem key={item.id} item={item} level={level + 1} />
              ))}
            </div>
          ) : (
            <div style={{ padding: "10px 0" }}>This folder is empty</div>
          )}
        </FolderChildren>
      )}
    </>
  );
};
