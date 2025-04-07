// src/components/FolderStructure/FolderStructure.tsx
import React, { Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useQuery } from "@tanstack/react-query";
import styled from "@emotion/styled";
import { fetchFolderContents } from "../../services/api";
import { FolderItem } from "./folder-item";
import { Pagination } from "./pagination";
import { RootState } from "../../store";
import { FolderItemType } from "../../types";

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
`;

interface RowRendererProps {
  index: number;
  key: string;
  parent: any;
  style: React.CSSProperties;
}

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

  // Create a cache for dynamic row heights
  const cache = new CellMeasurerCache({
    fixedWidth: true,
    defaultHeight: 50,
  });

  // Fetch content of the root folder
  const { data, isLoading } = useQuery({
    queryKey: ["folderContents", rootFolderId, currentPage],
    queryFn: () => fetchFolderContents(rootFolderId, currentPage, itemsPerPage),
  });

  if (isLoading) {
    return <Skeleton count={5} height={50} />;
  }

  // Và sửa lại hàm rowRenderer
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
            <FolderItem item={data?.items[index] as FolderItemType} level={0} />
          </div>
        )}
      </CellMeasurer>
    );
  };

  return (
    <Container>
      <Suspense fallback={<Skeleton count={5} height={50} />}>
        <div style={{ height: `${height}px` }}>
          <AutoSizer>
            {({ width }) => (
              <List
                width={width}
                height={height}
                deferredMeasurementCache={cache}
                rowCount={data?.items.length || 0}
                rowHeight={cache.rowHeight}
                rowRenderer={rowRenderer}
                overscanRowCount={5} // Số lượng hàng sẽ render thêm ngoài phạm vi nhìn thấy
              />
            )}
          </AutoSizer>
        </div>
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
