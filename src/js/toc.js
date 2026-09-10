export function buildToc(content) {
    const toc = [];
    const stack = [];

    content.forEach((item) => {
        if (item.type === 'heading') {
            const text = (item.content ?? []).map((elem) => elem.text).join('');
            if (!text) return; // Skip empty headings so they don't swallow later subheadings

            const heading = {
                text,
                level: item.attrs.level,
                children: [],
            };

            while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
                stack.pop();
            }

            if (stack.length === 0) {
                toc.push(heading);
            } else {
                stack[stack.length - 1].children.push(heading);
            }

            stack.push(heading);
        }
    });

    return toc;
}
