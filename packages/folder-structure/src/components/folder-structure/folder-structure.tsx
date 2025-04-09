// src/components/FolderStructure/FolderStructure.tsx
import React, { Suspense } from "react";
import { useSelector } from "react-redux";
import styled from "@emotion/styled";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { fetchFolderContents } from "../../services/api";
import { FolderItem } from "./folder-item";
import { Pagination } from "./pagination";
import { RootState } from "../../store";

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
  // const dispatch = useDispatch();
  const { currentPage, itemsPerPage } = useSelector(
    (state: RootState) => state.folder
  );

  // Fetch content of the root folder
  const { data, isLoading } = useQuery({
    queryKey: ["folderContents", rootFolderId, currentPage],
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
            {data?.items?.map((item) => (
              <FolderItem key={item.id} item={item} level={0} />
            ))}
            {data?.items?.length === 0 && (
              <div style={{ padding: "10px" }}>No items found</div>
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
