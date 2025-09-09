let hydrateDependency = true;

export const isHydrating = /* @__NO_SIDE_EFFECTS__ */ (): boolean => hydrateDependency;

/**
 * @private
 */
export const notHydrating = (): void => {
  hydrateDependency = false;
}
