import {
  Box,
  Flex,
  HStack,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
} from '@chakra-ui/react';

function ChirpSkeleton() {
  return (
    <Box mt="8">
      <Skeleton height="5" width="20" mb="3" />
      <SkeletonText />
      <Flex mt="2" alignItems="center">
        <SkeletonCircle mr="2" size="8" />
        <Skeleton width="10" height="5" mr="6" />
        <Skeleton width="10" height="5" mr="6" />
        <Skeleton width="10" height="5" mr="6" />
      </Flex>
    </Box>
  );
}

export default ChirpSkeleton;
